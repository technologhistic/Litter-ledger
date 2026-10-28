import React, { useState, useId } from 'react';
import { Plus, Edit2, Trash2, Droplet, Check, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Item, Sale, Settings } from '../types';
import { formatCurrency, formatLitres, generateUid, roundToTwo, DEFAULT_ITEMS } from '../utils/storage';

interface ItemsViewProps {
  items: Item[];
  sales: Sale[];
  settings: Settings;
  onAddItem: (item: Item) => void;
  onUpdateItemPrice: (id: string, newPrice: number) => void;
  onDeleteItem: (id: string) => void;
  onResetDefaultItems: () => void;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  sales,
  settings,
  onAddItem,
  onUpdateItemPrice,
  onDeleteItem,
  onResetDefaultItems,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const nameInputId = useId();
  const priceInputId = useId();

  // Compute all-time statistics for each item
  const itemStats = items.map((item) => {
    const itemSales = sales.filter((s) => s.item.toLowerCase() === item.name.toLowerCase());
    const totalLitres = roundToTwo(itemSales.reduce((acc, s) => acc + s.litres, 0));
    const totalAmount = roundToTwo(itemSales.reduce((acc, s) => acc + s.total, 0));
    return {
      ...item,
      totalLitres,
      totalAmount,
      salesCount: itemSales.length,
    };
  });

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const price = parseFloat(priceInput);

    if (!cleanName) {
      setMessage({ text: 'Please enter the item name.', ok: false });
      return;
    }

    if (isNaN(price) || price < 0) {
      setMessage({ text: 'Please enter a valid price for 1 litre.', ok: false });
      return;
    }

    const newItem: Item = {
      id: generateUid(),
      name: cleanName,
      price: roundToTwo(price),
      createdAt: Date.now(),
    };

    onAddItem(newItem);
    setNameInput('');
    setPriceInput('');
    setMessage({ text: `Added "${cleanName}" (${formatCurrency(price, settings.currency)}/L).`, ok: true });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleStartEdit = (item: Item) => {
    setEditingItemId(item.id);
    setEditPriceInput(item.price.toString());
  };

  const handleSaveEdit = (itemId: string) => {
    const p = parseFloat(editPriceInput);
    if (!isNaN(p) && p >= 0) {
      onUpdateItemPrice(itemId, roundToTwo(p));
      setEditingItemId(null);
      setMessage({ text: 'Item price updated.', ok: true });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Items & Price Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your liquid and dairy products, standard rate per litre, and catalog items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              onClick={onResetDefaultItems}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Starter Items</span>
            </button>
          )}
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemStats.map((item) => {
          const isEditing = editingItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {item.salesCount} {item.salesCount === 1 ? 'sale' : 'sales'} logged
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Edit Price"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setItemToDelete(item)}
                      title="Delete Item"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Display or Edit mode */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          placeholder="New price"
                          className="w-full px-3 py-1.5 text-sm font-bold font-mono border-2 border-blue-500 rounded-lg focus:outline-hidden"
                          autoFocus
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {settings.currency}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Save Price"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Standard Rate</span>
                      <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(item.price, settings.currency)} <span className="text-xs text-slate-500 font-sans font-normal">/ Litre</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* All-time volume and revenue breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Total Volume</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {formatLitres(item.totalLitres)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Total Earnings</span>
                  <span className="font-semibold text-blue-700 font-mono">
                    {formatCurrency(item.totalAmount, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Item Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs max-w-xl">
        <h3 className="text-base font-bold text-slate-900 mb-1">Add a New Item</h3>
        <p className="text-xs text-slate-500 mb-4">
          Add custom dairy, milk varieties, or liquid items to track with litre measurements.
        </p>

        <form onSubmit={handleAddNewItem} className="space-y-4">
          <div>
            <label htmlFor={nameInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              id={nameInputId}
              type="text"
              placeholder="e.g. Pure Buffalo Milk (भैँसीको दूध)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label htmlFor={priceInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cost of 1 Litre ({settings.currency}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id={priceInputId}
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 65.00"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {settings.currency} / L
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          {message && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                message.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
        </form>
      </div>

      {/* Delete Item Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Item?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to delete <strong>{itemToDelete.name}</strong>? Past sales records for this item will remain safely in your ledger.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
