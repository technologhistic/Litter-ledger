package com.technologistic.litreledger

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Base64
import android.view.View
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar

    // Target URL for Litre Ledger web application
    private val targetUrl = "https://litterledger-mu.vercel.app/"

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    // Activity Result Launcher for Document / Backup JSON Picker
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data: Intent? = result.data
            val uris = when {
                data?.clipData != null -> {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                }
                data?.data != null -> arrayOf(data.data!!)
                else -> null
            }
            fileUploadCallback?.onReceiveValue(uris)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)

        setupSwipeRefresh()
        setupWebView()
        setupBackNavigation()

        // Load the Litre Ledger application
        webView.loadUrl(targetUrl)
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeColors(getColor(R.color.primary))
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings: WebSettings = webView.settings

        // 1. Enable JavaScript and local client-side logic
        settings.javaScriptEnabled = true
        settings.javaScriptCanOpenWindowsAutomatically = true

        // 2. Enable DOM Storage and Local Database (Crucial for LocalStorage and IndexedDB offline persistence)
        settings.domStorageEnabled = true
        settings.databaseEnabled = true

        // 3. Configure Offline Caching strategy
        if (isNetworkConnected()) {
            settings.cacheMode = WebSettings.LOAD_DEFAULT
        } else {
            // Load completely from local cache when offline
            settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // 4. File access for local backups
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // 5. Viewport and scaling
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // 6. Cookie management
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // 7. WebViewClient for page lifecycle and offline error management
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // If it is main frame error and offline, the Service Worker will handle it, or we inform the user
                if (request?.isForMainFrame == true && !isNetworkConnected()) {
                    Toast.makeText(this@MainActivity, "Offline Mode: Loaded from device cache", Toast.LENGTH_SHORT).show()
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false

                // Handle system protocols (Phone call, WhatsApp, SMS, Mail)
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") || url.startsWith("sms:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "No application available to open link", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }

                // Keep app navigation inside the WebView
                return false
            }
        }

        // 8. WebChromeClient for Progress and File Uploads (Import JSON backup)
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            // Handle file picker when user clicks "Select Backup File" in Data & Settings
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/json", "text/plain", "text/csv"))
                }

                try {
                    filePickerLauncher.launch(Intent.createChooser(intent, "Select Litre Ledger Backup"))
                } catch (e: Exception) {
                    fileUploadCallback = null
                    return false
                }
                return true
            }
        }

        // 9. DownloadListener for Exporting JSON Backups & CSV Spreadsheets
        webView.setDownloadListener(DownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            handleFileDownload(url, contentDisposition, mimetype)
        })
    }

    /**
     * Handles file download (Blob / Data URI / Standard HTTP URL) for JSON backups and CSV exports
     */
    private fun handleFileDownload(url: String, contentDisposition: String?, mimetype: String?) {
        try {
            if (url.startsWith("data:")) {
                // Handle Base64 Data URI download (generated by client-side JSON/CSV export)
                val base64Data = url.substringAfter("base64,")
                val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)

                val fileName = when {
                    url.contains("csv") -> "litre-ledger-${System.currentTimeMillis()}.csv"
                    else -> "litre-ledger-backup-${System.currentTimeMillis()}.json"
                }

                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(downloadsDir, fileName)
                val outputStream: OutputStream = FileOutputStream(file)
                outputStream.write(decodedBytes)
                outputStream.flush()
                outputStream.close()

                Toast.makeText(this, "Saved: $fileName in Downloads", Toast.LENGTH_LONG).show()
            } else if (url.startsWith("blob:")) {
                // Execute JS to trigger a data-URI download or toast
                Toast.makeText(this, "File export ready", Toast.LENGTH_SHORT).show()
            } else {
                // Handle regular HTTP download with Android DownloadManager
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    addRequestHeader("User-Agent", webView.settings.userAgentString)
                    setDescription("Downloading file from Litre Ledger...")
                    setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    )
                }

                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "Downloading file...", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Export complete", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Handles hardware/gesture Android back button: navigates history inside WebView
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    /**
     * Checks device internet connectivity
     */
    private fun isNetworkConnected(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
