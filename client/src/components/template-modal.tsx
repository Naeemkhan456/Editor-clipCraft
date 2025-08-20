import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplate, X } from "lucide-react";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: string) => void;
}

export default function TemplateModal({ open, onOpenChange, onTemplateSelect }: TemplateModalProps) {
  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and modern design",
      preview: "https://via.placeholder.com/300x200/4CAF50/white?text=Modern"
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional and elegant design",
      preview: "https://via.placeholder.com/300x200/2196F3/white?text=Classic"
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple and clean design",
      preview: "https://via.placeholder.com/300x200/FF9800/white?text=Minimal"
    },
    {
      id: "vintage",
      name: "Vintage",
      description: "Retro and nostalgic design",
      preview: "https://via.placeholder.com/300x200/9C27B0/white?text=Vintage"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={template.preview} alt={template.name} className="w-full h-32 object-cover rounded" />
                <p className="text-sm text-gray-600 mt-2">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
