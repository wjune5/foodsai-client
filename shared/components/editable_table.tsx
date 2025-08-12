import React, { useState } from 'react';
import { Edit2, Save, X, Trash2, CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { FormControl } from './ui/form';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { Calendar } from "./ui/calendar";

interface TableRow {
  action: string;
  table: string;
  entity: string;
  quantity?: number;
  unit?: string;
  expirationDays?: number;
  dateFrom?: Date;
}

interface EditableTableProps {
  data: TableRow[];
  onDataChange: (newData: TableRow[]) => void;
  showActionColumn?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, onDataChange, showActionColumn = true }) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<TableRow | null>(null);
  const [open, setOpen] = useState(false)
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
      expirationDays: 0,
      dateFrom: new Date()
    };
    onDataChange([...data, newRow]);
    setEditingRow(data.length);
    setEditData(newRow);
  };

  const updateEditData = (
    field: keyof TableRow,
    value: string | number | Date | undefined
  ) => {
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
              <TableHead className="min-w-[140px]">Object</TableHead>
              <TableHead className="min-w-[40px]">Unit</TableHead>
              <TableHead className="min-w-[40px]">Quantity</TableHead>
              <TableHead className="min-w-[40px]">Expiry Days</TableHead>
              <TableHead className="min-w-[120px]">Create Date</TableHead>
              <TableHead className="min-w-[60px]">Actions</TableHead>
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
                <TableCell className="min-w-[140px]">
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
                <TableCell className="min-w-[40px]">
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
               
                <TableCell className="min-w-[40px]">
                  {editingRow === index ? (
                     <Stepper
                      value={editData?.expirationDays || 0}
                      onChange={(value) => updateEditData('expirationDays', value)}
                      min={1}
                      className="w-full h-8"
                    />
                  ) : (
                    <div className="truncate">
                      {row.expirationDays ? row.expirationDays : '-'}
                    </div>
                  )}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  {editingRow === index ? (
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                          <FormControl>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !editData?.dateFrom && "text-muted-foreground"
                                  )}
                              >
                                  {editData?.dateFrom ? (
                                      format(editData?.dateFrom, "PPP")
                                  ) : (
                                      <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                          </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={editData?.dateFrom}
                              onSelect={(date: Date | undefined) => {
                                  updateEditData('dateFrom', date)
                                  setOpen(false)
                              }}
                              disabled={(date: Date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                          />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="truncate">{row.dateFrom ? format(row.dateFrom, "PPP") : '-'}</div>
                  )}
                </TableCell>
                <TableCell className="min-w-[60px]">
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