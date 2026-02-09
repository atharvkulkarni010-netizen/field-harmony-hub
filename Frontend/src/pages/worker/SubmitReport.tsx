import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Upload, Image, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { taskAssignmentsApi, reportsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface AssignedTask {
  assignment_id: number;
  task_id: number;
  title: string;
  project_name: string;
}

export default function SubmitReport() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      const response = await taskAssignmentsApi.getMyAssignments();
      setAssignedTasks(response.data);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned tasks.',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description of your work.',
        variant: 'destructive',
      });
      return;
    }

    // Optional: Enforce task selection if business logic requires it
    // if (selectedTasks.length === 0) { ... }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('report_date', new Date().toISOString().split('T')[0]);
      
      // Append task IDs as JSON string or individual fields depending on backend expectation
      // Backend controller parses 'task_ids'
      formData.append('task_ids', JSON.stringify(selectedTasks));

      images.forEach((image) => {
        formData.append('images', image);
      });

      await reportsApi.submit(formData);

      toast({
        title: 'Report Submitted',
        description: 'Your daily report has been submitted successfully.',
      });

      navigate('/worker');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Daily Report"
        description="Document your work for today"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Related Tasks */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Related Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {assignedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned.</p>
             ) : (
                assignedTasks.map((task) => (
                  <label
                    key={task.task_id}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedTasks.includes(task.task_id.toString())
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedTasks.includes(task.task_id.toString())}
                      onCheckedChange={() => toggleTask(task.task_id.toString())}
                    />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.project_name}</p>
                    </div>
                  </label>
                ))
             )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <FileText className="w-5 h-5 text-primary" />
              Work Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work you completed today. Include any observations, challenges, or noteworthy findings..."
              className="min-h-[150px] rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Image className="w-5 h-5 text-primary" />
              Photo Evidence
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Optional, max 5 images)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <label
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:bg-muted/50 ${
                images.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'border-primary/30'
              }`}
            >
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <span className="text-sm font-medium">Click to upload images</span>
              <span className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </span>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={images.length >= 5}
              />
            </label>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg rounded-xl gradient-forest text-primary-foreground font-semibold"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
