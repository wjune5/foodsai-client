import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslations } from 'next-intl';
import { units } from '@/shared/constants/constants';
import { Stepper } from './stepper';

interface TableRow {
  action: string;
  table: string;
  entity: string;
  quantity?: number;
  unit?: string;
  expirationDate?: string;
}

interface EditableTableProps {
  data: TableRow[];
  onDataChange: (newData: TableRow[]) => void;
  showActionColumn?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, onDataChange, showActionColumn = true }) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<TableRow | null>(null);
  const t = useTranslations();

  const handleEdit = (index: number) => {
    setEditingRow(index);
    setEditData({ ...data[index] });
  };

  const handleSave = (index: number) => {
    if (editData) {
      const newData = [...data];
      newData[index] = editData;
      onDataChange(newData);
      setEditingRow(null);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleDelete = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onDataChange(newData);
  };

  const handleAdd = () => {
    const newRow: TableRow = {
      action: 'add',
      table: 'Inventory',
      entity: '',
      quantity: 1,
      unit: 'pcs',
      expirationDate: ''
    };
    onDataChange([...data, newRow]);
    setEditingRow(data.length);
    setEditData(newRow);
  };

  const updateEditData = (field: keyof TableRow, value: string | number) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  return (
    <div className="w-full overflow-hidden border rounded-lg">
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              {showActionColumn && <TableHead className="min-w-[80px]">Action</TableHead>}
              <TableHead className="min-w-[120px]">Object</TableHead>
              <TableHead className="min-w-[40px]">Unit</TableHead>
              <TableHead className="min-w-[50px]">Quantity</TableHead>
              <TableHead className="min-w-[60px]">Expiration Date</TableHead>
              <TableHead className="min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {showActionColumn && (
                  <TableCell className="min-w-[80px]">
                    {editingRow === index ? (
                      <Select value={editData?.action || ''} onValueChange={(value) => updateEditData('action', value)}>
                          <SelectTrigger className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm">
                              <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="add">{t('common.add')}</SelectItem>
                              <SelectItem value="update">{t('common.update')}</SelectItem>
                              <SelectItem value="delete">{t('common.delete')}</SelectItem>
                          </SelectContent>
                      </Select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {row.action}
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="min-w-[120px]">
                  {editingRow === index ? (
                    <Input
                      type="text"
                      value={editData?.entity || ''}
                      onChange={(e) => updateEditData('entity', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    />
                  ) : (
                    <div className="font-medium truncate">{row.entity}</div>
                  )}
                </TableCell>
                <TableCell className="min-w-[40px]">
                  {editingRow === index ? (
                    <Select value={editData?.unit || ''} onValueChange={(value) => updateEditData('unit', value)}>
                      <SelectTrigger className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="truncate">{row.unit || '-'}</div>
                  )}
                </TableCell>
                <TableCell className="min-w-[50px]">
                  {editingRow === index ? (
                    <Stepper
                      value={editData?.quantity || 0}
                      onChange={(value) => updateEditData('quantity', value)}
                      min={1}
                      className="w-full h-8"
                    />
                  ) : (
                    <div>{row.quantity || '-'}</div>
                  )}
                </TableCell>
               
                <TableCell className="min-w-[60px]">
                  {editingRow === index ? (
                    <Input
                      type="date"
                      value={editData?.expirationDate || ''}
                      onChange={(e) => updateEditData('expirationDate', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    />
                  ) : (
                    <div className="truncate">
                      {row.expirationDate ? new Date(row.expirationDate).toLocaleDateString() : '-'}
                    </div>
                  )}
                </TableCell>
                <TableCell className="min-w-[80px]">
                  <div className="flex items-center space-x-2">
                    {editingRow === index ? (
                      <>
                        <button
                          onClick={() => handleSave(index)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-pink-600 hover:text-pink-900 transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EditableTable; 