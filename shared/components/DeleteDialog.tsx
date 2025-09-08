import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDelete: () => void;
}
const DeleteDialog: React.FC<DeleteDialogProps> = ({ showDeleteDialog, setShowDeleteDialog, confirmDelete }) => {
  const t = useTranslations();
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            {t('common.delete')}
          </DialogTitle>
          <DialogDescription>
            {t('recipe.confirmDelete')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            className="w-full sm:w-auto"
          >
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DeleteDialog;