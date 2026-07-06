"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Grid3X3, Zap } from "lucide-react";

interface SystemMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMethodSelect: (method: "gauss" | "cramer") => void;
  matrixSize: number;
  isSquare: boolean;
}

export const SystemMethodDialog = ({
  open,
  onOpenChange,
  onMethodSelect,
  matrixSize,
  isSquare,
}: SystemMethodDialogProps) => {
  const { t } = useTranslation();
  // const isCramerApplicable = isSquare;
  const isCramerApplicable = true;
  const isGaussApplicable = true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            {t("dialogs.systemResolutionMethod")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogs.chooseSystemResolutionMethod")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isCramerApplicable
                ? "border-purple-200 dark:border-purple-800/40 hover:border-purple-400 dark:hover:border-purple-600"
                : "border-gray-200 dark:border-gray-700 opacity-60"
            }`}
            onClick={() => isCramerApplicable && onMethodSelect("cramer")}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Grid3X3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {t("dialogs.cramersRule")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("dialogs.cramersDescription")}
                </p>
                {!isCramerApplicable && (
                  <p className="text-xs text-orange-600 mt-2">
                    {t("dialogs.notAvailableForNonSquare")}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer border-blue-200 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all" ${
              isGaussApplicable
                ? "border-purple-200 dark:border-purple-800/40 hover:border-purple-400 dark:hover:border-purple-600"
                : "border-gray-200 dark:border-gray-700 opacity-60"
            }`}
            onClick={() => isGaussApplicable && onMethodSelect("gauss")}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {t("dialogs.gaussianElimination")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("dialogs.gaussianDescription")}
                </p>
                {!isGaussApplicable && (
                  <p className="text-xs text-orange-600 mt-2">
                    {t("dialogs.notAvailableNow")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={() => onMethodSelect("cramer")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t("dialogs.useCramerDefault")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
