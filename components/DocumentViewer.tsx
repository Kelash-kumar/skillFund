"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";

interface DocumentViewerProps {
  studentId: string;
  documents: Record<string, {
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
  }>;
}

export function DocumentViewer({ studentId, documents }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentLabel = (docType: string): string => {
    const labels: Record<string, string> = {
      academicTranscript: "Academic Transcript",
      marksheets: "Marksheets/Certificates",
      bankSlip: "Bank Statement",
      electricityBill: "Electricity Bill",
      idCard: "National ID/CNIC"
    };
    return labels[docType] || docType;
  };

  const handleViewDocument = async (fileName: string, docType: string) => {
    setIsLoading(docType);
    try {
      const url = `/api/files/${studentId}/${fileName}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadDocument = async (fileName: string, originalName: string, docType: string) => {
    setIsLoading(docType);
    try {
      const response = await fetch(`/api/files/${studentId}/${fileName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploaded Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(documents).map(([docType, doc]) => (
            <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{getDocumentLabel(docType)}</h4>
                  <Badge variant="secondary">
                    {doc.fileType.includes('pdf') ? 'PDF' : 'Image'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{doc.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {formatFileSize(doc.fileSize)} • 
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDocument(doc.fileName, docType)}
                  disabled={isLoading === docType}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadDocument(doc.fileName, doc.originalName, docType)}
                  disabled={isLoading === docType}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}