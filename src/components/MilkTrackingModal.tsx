import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MilkDetail } from '../types/database';
import { Button } from './Button';
import { Input } from './Input';

interface MilkTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit' | null;
}

export function MilkTrackingModal({ isOpen, onClose, mode }: MilkTrackingModalProps) {
  const [milkDetails, setMilkDetails] = useState<MilkDetail[]>([]);
  const [rate, setRate] = useState<number>(45);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const fetchMilkDetails = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('milk_details')
        .select('sr_no, kg', { count: 'exact' })
        .order('sr_no', { ascending: true });

      if (error) throw error;
      setMilkDetails(data || []);
    } catch (error) {
      console.error('Error fetching milk details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMilkDetails();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset editing state when switching to view mode
  useEffect(() => {
    if (mode === 'view') {
      setEditingRow(null);
      setEditValue('');
    }
  }, [mode]);

  const handleEdit = (sr_no: number, currentKg: number) => {
    setEditingRow(sr_no);
    setEditValue(currentKg.toString());
  };

  const handleSave = async () => {
    if (editingRow === null) return;

    try {
      const newKg = parseFloat(editValue);
      if (isNaN(newKg)) return;

      const { error } = await supabase
        .from('milk_details')
        .update({ kg: newKg })
        .eq('sr_no', editingRow);

      if (error) throw error;

      // Update local state
      setMilkDetails(prev =>
        prev.map(item =>
          item.sr_no === editingRow ? { ...item, kg: newKg } : item
        )
      );

      setEditingRow(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating milk detail:', error);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValue('');
  };

  const totalKg = milkDetails.reduce((sum, item) => sum + item.kg, 0);
  const totalAmount = totalKg * rate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Milk Tracking</h2>
          <button onClick={onClose} className="text-tertiary hover:text-primary transition-colors" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-secondary/50 border border-primary rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-secondary mb-2">Rate (per kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                  disabled={mode === 'view'}
                />
              </div>
              <div className="flex gap-6 md:justify-end">
                <div className="text-center">
                  <p className="text-sm text-secondary">Total KG</p>
                  <p className="text-xl font-semibold text-primary">{totalKg.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-secondary">Total Amount</p>
                  <p className="text-xl font-semibold text-primary">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Milk Details Table */}
          <div className="mb-4 text-sm text-secondary">
            Showing {milkDetails.length} milk entries
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-secondary">Loading milk details...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-primary">
                <thead>
                  <tr className="bg-secondary">
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">Sr No</th>
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">KG</th>
                    <th className="border border-primary px-4 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milkDetails.map((detail) => (
                    <tr key={detail.sr_no} className="hover:bg-secondary/50">
                      <td className="border border-primary px-4 py-2 text-sm">{detail.sr_no}</td>
                      <td className="border border-primary px-4 py-2">
                        {editingRow === detail.sr_no ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{detail.kg.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="border border-primary px-4 py-2">
                        {mode !== 'view' && (
                          <>
                            {editingRow === detail.sr_no ? (
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSave}
                                  variant="primary"
                                  size="sm"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleEdit(detail.sr_no, detail.kg)}
                                variant="secondary"
                                size="sm"
                              >
                                Edit
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}