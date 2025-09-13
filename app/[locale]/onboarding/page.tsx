"use client";

import { FC, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tag,
  Palette,
  Settings,
  ArrowRight,
  Star,
  GripVertical,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useLocalizedPath from "@/shared/hooks/useLocalizedPath";
import { Category } from "@/shared/entities/inventory";
import { databaseService } from "@/shared/services/DatabaseService";
import { useAuth } from "@/shared/context/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CategoryForm from "../categories/components/CategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/Dialog";
import { CategoryFormData } from "../categories/type/interface";
import { CustomIcon } from "@/shared/entities/setting";
import { toast } from "sonner";
import { renderSvgIcon } from "@/shared/constants/food-icons";
import IconForm from "../icons/components/IconForm";
import { IconFormData } from "../icons/types/interface";

const GuidePage: FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const localize = useLocalizedPath();
  const locale = useLocale();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] =
    useState<Category | null>(null);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const cats = await databaseService.getCategories(locale);
        setCategories(cats.sort((a, b) => a.sortValue - b.sortValue));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
    loadIcons();
  }, [locale]);

  const loadIcons = async () => {
    try {
      const icons = await databaseService.getCustomIcons();
      setCustomIcons(icons);
    } catch (error) {
      console.error("Failed to load custom icons:", error);
      toast.error(t("errors.serverError"));
    }
  };

  const navigateTo = (path: string) => {
    router.push(localize(path));
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsCompleting(true);
      await completeOnboarding();
      navigateTo("/inventory/add");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Still navigate even if completion fails
      navigateTo("/inventory/add");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddCategory = async (categoryData: CategoryFormData) => {
    try {
      const newCategory = await databaseService.addCategory({
        ...categoryData,
        id: "",
        sortValue: categories.length,
        count: 0,
      });
      setCategories((prev) => [...prev, newCategory]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  // Close modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  // Handle form submission
  const handleFormSubmit = async (data: IconFormData) => {
    try {
      await databaseService.addCustomIcon({
        id: "",
        ...data,
        builtIn: false,
        isActive: true,
      });
      toast.success(t("message.addSuccess"));

      await loadIcons();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save icon:", error);
      toast.error(t("errors.serverError"));
    }
  };
  // Draggable Category Item Component
  const DraggableCategoryItem: FC<{
    category: Category;
    onClick: () => void;
  }> = ({ category, onClick }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all group bg-white"
      >
        <div className="flex items-center gap-3">
          <div
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <h4 className="font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-colors">
              {category.displayName}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {!category.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategoryToDelete(category);
                  setIsDeleteDialogOpen(true);
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t("common.delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t("guide.title")}
          </h1>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className="flex flex-col items-center"
              onClick={() => setCurrentStep(1)}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentStep >= 1
                    ? "bg-gradient-to-r from-pink-500 to-purple-600"
                    : "bg-gray-300"
                }`}
              >
                1
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= 1 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {t("categories.title")}
                </p>
              </div>
            </div>

            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentStep >= 2
                    ? "bg-gradient-to-r from-pink-500 to-purple-600"
                    : "bg-gray-300"
                }`}
              >
                2
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {t("icons.title")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <div>
                {/* Categories Overview */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardDescription>
                      {t("guide.categories.overviewDescription")}
                      <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded"></div>
                        {t("guide.categories.dragToReorder")}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-8">
                        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {t("guide.categories.noCategories")}
                        </p>
                        <Button
                          onClick={() => navigateTo("/categories")}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          {t("guide.categories.createFirstCategory")}
                        </Button>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={categories.map((cat) => cat.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {categories.map((category) => (
                              <DraggableCategoryItem
                                key={category.id}
                                category={category}
                                onClick={() => navigateTo("/categories")}
                              />
                            ))}

                            {/* Add Category Button */}
                            <div className="flex justify-center mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(true)}
                                className="border-dashed border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 text-gray-600 hover:text-pink-700 transition-all group"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center mr-2 transition-colors">
                                  <Plus className="w-3 h-3" />
                                </div>
                                {t("guide.categories.addCategory")}
                              </Button>
                            </div>
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </CardContent>
                </Card>

                {/* Next Step Button */}
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-500 hover:to-purple-700 text-white px-8 py-3 text-lg"
                  >
                    {t("common.next")}
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Default Icons Preview */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      {t("guide.icons.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {customIcons.map((icon) => (
                        <div
                          key={icon.id}
                          className="flex flex-col items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 bg-white rounded-lg p-2 shadow-sm mb-2 group-hover:shadow-md transition-shadow flex items-center justify-center">
                            <div className="w-12 h-12 text-gray-600">
                              {renderSvgIcon(icon.svgContent, icon.builtIn)}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 text-center font-medium">
                            {icon.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Icons Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      {t("guide.icons.customTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-purple-600" />
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => navigateTo("/icons")}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          {t("guide.icons.browseIcons")}
                        </Button>
                        <Button
                          onClick={() => {setIsEditModalOpen(true)} }
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {t("guide.icons.customizeIcons")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Start Using App Button */}
                <div className="text-center mt-8">
                  <Button
                    onClick={handleCompleteOnboarding}
                    disabled={isCompleting}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50"
                  >
                    {isCompleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        {t("guide.steps.startUsingApp")}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto pb-6 px-6">
            <DialogHeader className="sticky w-50 top-0 bg-white z-10 pb-4 pt-6">
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                {t("common.add")}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleAddCategory}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                {t("common.delete")}
              </DialogTitle>
            </DialogHeader>
            <div className="px-6">
              <p className="text-gray-600">
                {t("categories.deleteConfirmation", {
                  name: selectedCategoryToDelete?.displayName || "",
                })}
              </p>
              {selectedCategoryToDelete &&
                (selectedCategoryToDelete.count || 0) > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {t("categories.deleteWarning", {
                        count: selectedCategoryToDelete.count || 0,
                      })}
                    </p>
                  </div>
                )}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedCategoryToDelete(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!selectedCategoryToDelete?.id) return;
                    try {
                      await databaseService.deleteCategory(
                        selectedCategoryToDelete.id
                      );
                      setCategories((prev) =>
                        prev.filter(
                          (cat) => cat.id !== selectedCategoryToDelete.id
                        )
                      );
                    } catch (error) {
                      console.error("Failed to delete category:", error);
                    } finally {
                      setIsDeleteDialogOpen(false);
                      setSelectedCategoryToDelete(null);
                    }
                  }}
                >
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Add/Edit Icon Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle>{t("icons.addIcon")}</DialogTitle>
            </DialogHeader>

            <IconForm
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
              showCard={false}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GuidePage;
