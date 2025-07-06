import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/Table";
import { Input } from "@/shared/components/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { useTranslations } from 'next-intl';

interface TableRow {
  action: string;
  table: string;
  entity: string;
  quantity?: number;
  unit?: string;
  description?: string;
  expirationDate?: string;
}

interface EditableTableProps {
  data: TableRow[];
  onDataChange: (newData: TableRow[]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, onDataChange }) => {
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
      description: '',
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
    <div className="card-cute overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Data Table</h3>
          <button
            onClick={handleAdd}
            className="btn-cute flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <Table>
          <TableCaption>A list of editable data entries.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead className="w-[150px]">Object</TableHead>
              <TableHead className="w-[100px]">Unit</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead className="w-[140px]">Expiration Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="w-[100px]">
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
                <TableCell className="w-[150px]">
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
                <TableCell className="w-[100px]">
                  {editingRow === index ? (
                    <Input
                      type="text"
                      value={editData?.unit || ''}
                      onChange={(e) => updateEditData('unit', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    />
                  ) : (
                    <div className="truncate">{row.unit || '-'}</div>
                  )}
                </TableCell>
                <TableCell className="w-[100px]">
                  {editingRow === index ? (
                    <Input
                      type="number"
                      value={editData?.quantity || ''}
                      onChange={(e) => updateEditData('quantity', parseInt(e.target.value) || 0)}
                      className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    />
                  ) : (
                    <div>{row.quantity || '-'}</div>
                  )}
                </TableCell>
                <TableCell className="w-[200px]">
                  {editingRow === index ? (
                    <Input
                      type="text"
                      value={editData?.description || ''}
                      onChange={(e) => updateEditData('description', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    />
                  ) : (
                    <div className="truncate">{row.description || '-'}</div>
                  )}
                </TableCell>
                <TableCell className="w-[140px]">
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
                <TableCell className="w-[100px]">
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