"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  _id: string;
  title: string;
  provider: string;
  fee: number;
  category: string;
}

export default function RequestCourse() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [availableCourseForm, setAvailableCourseForm] = useState({
    courseId: "",
    reason: "",
    careerGoals: "",
    previousExperience: "",
    expectedOutcome: "",
    urgency: "medium",
    // Document files
    academicTranscript: null as File | null,
    marksheets: null as File | null,
    bankSlip: null as File | null,
    electricityBill: null as File | null,
    idCard: null as File | null
  });

  const [newCourseForm, setNewCourseForm] = useState({
    title: "",
    provider: "",
    estimatedFee: "",
    category: "",
    description: "",
    courseUrl: "",
    duration: "",
    reason: "",
    careerGoals: "",
    previousExperience: "",
    expectedOutcome: "",
    urgency: "medium",
    // Document files
    academicTranscript: null as File | null,
    marksheets: null as File | null,
    bankSlip: null as File | null,
    electricityBill: null as File | null,
    idCard: null as File | null
  });

  const [certificationForm, setCertificationForm] = useState({
    certificationType: "",
    provider: "",
    estimatedFee: "",
    description: "",
    reason: "",
    careerGoals: "",
    previousExperience: "",
    expectedOutcome: "",
    urgency: "medium",
    // Document files
    academicTranscript: null as File | null,
    marksheets: null as File | null,
    bankSlip: null as File | null,
    electricityBill: null as File | null,
    idCard: null as File | null
  });

  // Load available courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const courses = await response.json();
          setAvailableCourses(courses);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const submitAvailableCourseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('requestType', 'available-course');
      formData.append('courseId', availableCourseForm.courseId);
      formData.append('reason', availableCourseForm.reason);
      formData.append('careerGoals', availableCourseForm.careerGoals);
      formData.append('previousExperience', availableCourseForm.previousExperience);
      formData.append('expectedOutcome', availableCourseForm.expectedOutcome);
      formData.append('urgency', availableCourseForm.urgency);

      // Append files
      if (availableCourseForm.academicTranscript) {
        formData.append('academicTranscript', availableCourseForm.academicTranscript);
      }
      if (availableCourseForm.marksheets) {
        formData.append('marksheets', availableCourseForm.marksheets);
      }
      if (availableCourseForm.bankSlip) {
        formData.append('bankSlip', availableCourseForm.bankSlip);
      }
      if (availableCourseForm.electricityBill) {
        formData.append('electricityBill', availableCourseForm.electricityBill);
      }
      if (availableCourseForm.idCard) {
        formData.append('idCard', availableCourseForm.idCard);
      }

      const response = await fetch("/api/student/request-course", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your course request has been submitted successfully.",
        });
        setAvailableCourseForm({ 
          courseId: "", 
          reason: "", 
          careerGoals: "",
          previousExperience: "",
          expectedOutcome: "",
          urgency: "medium",
          academicTranscript: null,
          marksheets: null,
          bankSlip: null,
          electricityBill: null,
          idCard: null
        });
        router.push("/student/applications");
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitNewCourseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('requestType', 'new-course');
      formData.append('title', newCourseForm.title);
      formData.append('provider', newCourseForm.provider);
      formData.append('estimatedFee', newCourseForm.estimatedFee);
      formData.append('category', newCourseForm.category);
      formData.append('description', newCourseForm.description);
      formData.append('courseUrl', newCourseForm.courseUrl);
      formData.append('duration', newCourseForm.duration);
      formData.append('reason', newCourseForm.reason);
      formData.append('careerGoals', newCourseForm.careerGoals);
      formData.append('previousExperience', newCourseForm.previousExperience);
      formData.append('expectedOutcome', newCourseForm.expectedOutcome);
      formData.append('urgency', newCourseForm.urgency);

      // Append files
      if (newCourseForm.academicTranscript) {
        formData.append('academicTranscript', newCourseForm.academicTranscript);
      }
      if (newCourseForm.marksheets) {
        formData.append('marksheets', newCourseForm.marksheets);
      }
      if (newCourseForm.bankSlip) {
        formData.append('bankSlip', newCourseForm.bankSlip);
      }
      if (newCourseForm.electricityBill) {
        formData.append('electricityBill', newCourseForm.electricityBill);
      }
      if (newCourseForm.idCard) {
        formData.append('idCard', newCourseForm.idCard);
      }

      const response = await fetch("/api/student/request-course", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your new course request has been submitted successfully.",
        });
        setNewCourseForm({
          title: "",
          provider: "",
          estimatedFee: "",
          category: "",
          description: "",
          courseUrl: "",
          duration: "",
          reason: "",
          careerGoals: "",
          previousExperience: "",
          expectedOutcome: "",
          urgency: "medium",
          academicTranscript: null,
          marksheets: null,
          bankSlip: null,
          electricityBill: null,
          idCard: null
        });
        router.push("/student/applications");
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitCertificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('requestType', 'certification');
      formData.append('certificationType', certificationForm.certificationType);
      formData.append('provider', certificationForm.provider);
      formData.append('estimatedFee', certificationForm.estimatedFee);
      formData.append('description', certificationForm.description);
      formData.append('reason', certificationForm.reason);
      formData.append('careerGoals', certificationForm.careerGoals);
      formData.append('previousExperience', certificationForm.previousExperience);
      formData.append('expectedOutcome', certificationForm.expectedOutcome);
      formData.append('urgency', certificationForm.urgency);

      // Append files
      if (certificationForm.academicTranscript) {
        formData.append('academicTranscript', certificationForm.academicTranscript);
      }
      if (certificationForm.marksheets) {
        formData.append('marksheets', certificationForm.marksheets);
      }
      if (certificationForm.bankSlip) {
        formData.append('bankSlip', certificationForm.bankSlip);
      }
      if (certificationForm.electricityBill) {
        formData.append('electricityBill', certificationForm.electricityBill);
      }
      if (certificationForm.idCard) {
        formData.append('idCard', certificationForm.idCard);
      }

      const response = await fetch("/api/student/request-course", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your certification request has been submitted successfully.",
        });
        setCertificationForm({
          certificationType: "",
          provider: "",
          estimatedFee: "",
          description: "",
          reason: "",
          careerGoals: "",
          previousExperience: "",
          expectedOutcome: "",
          urgency: "medium",
          academicTranscript: null,
          marksheets: null,
          bankSlip: null,
          electricityBill: null,
          idCard: null
        });
        router.push("/student/applications");
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || session.user?.userType !== "student") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Access denied. Students only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Request Course or Certification</h1>
        <p className="text-muted-foreground mt-2">
          Submit a request for funding support for your educational needs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Request Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Courses</TabsTrigger>
              <TabsTrigger value="new">New Course</TabsTrigger>
              <TabsTrigger value="certification">Certification</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Request for Available Course</h3>
                <p className="text-sm text-muted-foreground">
                  Select from courses already available in our catalog
                </p>
              </div>

              <form onSubmit={submitAvailableCourseRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseSelect">Select Course</Label>
                  {loadingCourses ? (
                    <div className="text-sm text-muted-foreground">Loading courses...</div>
                  ) : (
                    <Select
                      value={availableCourseForm.courseId}
                      onValueChange={(value) =>
                        setAvailableCourseForm(prev => ({ ...prev, courseId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title} - {course.provider} (${course.fee})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={availableCourseForm.urgency}
                    onValueChange={(value) =>
                      setAvailableCourseForm(prev => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    value={availableCourseForm.reason}
                    onChange={(e) =>
                      setAvailableCourseForm(prev => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Explain why you need this course and how it will benefit your career..."
                    required
                  />
                </div>

                <Separator />

                {/* Additional Details Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Additional Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="careerGoals">Career Goals</Label>
                    <Textarea
                      id="careerGoals"
                      value={availableCourseForm.careerGoals}
                      onChange={(e) =>
                        setAvailableCourseForm(prev => ({ ...prev, careerGoals: e.target.value }))
                      }
                      placeholder="Describe your long-term career goals and how this course fits into your career plan..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousExperience">Previous Experience</Label>
                    <Textarea
                      id="previousExperience"
                      value={availableCourseForm.previousExperience}
                      onChange={(e) =>
                        setAvailableCourseForm(prev => ({ ...prev, previousExperience: e.target.value }))
                      }
                      placeholder="Describe any relevant previous experience, education, or certifications in this field..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                    <Textarea
                      id="expectedOutcome"
                      value={availableCourseForm.expectedOutcome}
                      onChange={(e) =>
                        setAvailableCourseForm(prev => ({ ...prev, expectedOutcome: e.target.value }))
                      }
                      placeholder="What specific skills or knowledge do you expect to gain? How will you apply it?"
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Required Documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Please upload the following documents to support your application:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicTranscript">Academic Transcript *</Label>
                      <Input
                        id="academicTranscript"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvailableCourseForm(prev => ({ ...prev, academicTranscript: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marksheets">Marksheets/Certificates *</Label>
                      <Input
                        id="marksheets"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvailableCourseForm(prev => ({ ...prev, marksheets: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankSlip">Bank Statement/Slip *</Label>
                      <Input
                        id="bankSlip"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvailableCourseForm(prev => ({ ...prev, bankSlip: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Financial proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="electricityBill">Electricity Bill *</Label>
                      <Input
                        id="electricityBill"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvailableCourseForm(prev => ({ ...prev, electricityBill: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Address proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idCard">National ID/CNIC *</Label>
                      <Input
                        id="idCard"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvailableCourseForm(prev => ({ ...prev, idCard: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Identity proof (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Request for New Course</h3>
                <p className="text-sm text-muted-foreground">
                  Request a course that's not currently in our catalog
                </p>
              </div>

              <form onSubmit={submitNewCourseRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newTitle">Course Title</Label>
                    <Input
                      id="newTitle"
                      value={newCourseForm.title}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g., Advanced React Development"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newProvider">Course Provider</Label>
                    <Input
                      id="newProvider"
                      value={newCourseForm.provider}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, provider: e.target.value }))
                      }
                      placeholder="e.g., Udemy, Coursera, edX"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEstimatedFee">Estimated Fee ($)</Label>
                    <Input
                      id="newEstimatedFee"
                      type="number"
                      value={newCourseForm.estimatedFee}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, estimatedFee: e.target.value }))
                      }
                      placeholder="299"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newCategory">Category</Label>
                    <Input
                      id="newCategory"
                      value={newCourseForm.category}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, category: e.target.value }))
                      }
                      placeholder="e.g., Web Development, Data Science"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseUrl">Course URL</Label>
                    <Input
                      id="courseUrl"
                      type="url"
                      value={newCourseForm.courseUrl}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, courseUrl: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newCourseForm.duration}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, duration: e.target.value }))
                      }
                      placeholder="e.g., 8 weeks, 40 hours"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newUrgency">Urgency Level</Label>
                  <Select
                    value={newCourseForm.urgency}
                    onValueChange={(value) =>
                      setNewCourseForm(prev => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newDescription">Course Description</Label>
                  <Textarea
                    id="newDescription"
                    value={newCourseForm.description}
                    onChange={(e) =>
                      setNewCourseForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what the course covers and its learning objectives..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newReason">Reason for Request</Label>
                  <Textarea
                    id="newReason"
                    value={newCourseForm.reason}
                    onChange={(e) =>
                      setNewCourseForm(prev => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Explain why you need this specific course and how it aligns with your career goals..."
                    required
                  />
                </div>

                <Separator />

                {/* Additional Details Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Additional Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newCareerGoals">Career Goals</Label>
                    <Textarea
                      id="newCareerGoals"
                      value={newCourseForm.careerGoals}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, careerGoals: e.target.value }))
                      }
                      placeholder="Describe your long-term career goals and how this new course fits into your career plan..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPreviousExperience">Previous Experience</Label>
                    <Textarea
                      id="newPreviousExperience"
                      value={newCourseForm.previousExperience}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, previousExperience: e.target.value }))
                      }
                      placeholder="Describe any relevant previous experience, education, or certifications in this field..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newExpectedOutcome">Expected Outcome</Label>
                    <Textarea
                      id="newExpectedOutcome"
                      value={newCourseForm.expectedOutcome}
                      onChange={(e) =>
                        setNewCourseForm(prev => ({ ...prev, expectedOutcome: e.target.value }))
                      }
                      placeholder="What specific skills or knowledge do you expect to gain? How will you apply it in your career?"
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Required Documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Please upload the following documents to support your application:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newAcademicTranscript">Academic Transcript *</Label>
                      <Input
                        id="newAcademicTranscript"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCourseForm(prev => ({ ...prev, academicTranscript: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newMarksheets">Marksheets/Certificates *</Label>
                      <Input
                        id="newMarksheets"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCourseForm(prev => ({ ...prev, marksheets: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newBankSlip">Bank Statement/Slip *</Label>
                      <Input
                        id="newBankSlip"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCourseForm(prev => ({ ...prev, bankSlip: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Financial proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newElectricityBill">Electricity Bill *</Label>
                      <Input
                        id="newElectricityBill"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCourseForm(prev => ({ ...prev, electricityBill: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Address proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newIdCard">National ID/CNIC *</Label>
                      <Input
                        id="newIdCard"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCourseForm(prev => ({ ...prev, idCard: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Identity proof (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit New Course Request"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="certification" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Request for Certification</h3>
                <p className="text-sm text-muted-foreground">
                  Request funding for professional certifications and exams
                </p>
              </div>

              <form onSubmit={submitCertificationRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificationType">Certification Name</Label>
                    <Input
                      id="certificationType"
                      value={certificationForm.certificationType}
                      onChange={(e) =>
                        setCertificationForm(prev => ({ ...prev, certificationType: e.target.value }))
                      }
                      placeholder="e.g., AWS Solutions Architect, PMP"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certProvider">Certification Provider</Label>
                    <Input
                      id="certProvider"
                      value={certificationForm.provider}
                      onChange={(e) =>
                        setCertificationForm(prev => ({ ...prev, provider: e.target.value }))
                      }
                      placeholder="e.g., AWS, PMI, Microsoft"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certEstimatedFee">Estimated Fee ($)</Label>
                  <Input
                    id="certEstimatedFee"
                    type="number"
                    value={certificationForm.estimatedFee}
                    onChange={(e) =>
                      setCertificationForm(prev => ({ ...prev, estimatedFee: e.target.value }))
                    }
                    placeholder="150"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certUrgency">Urgency Level</Label>
                  <Select
                    value={certificationForm.urgency}
                    onValueChange={(value) =>
                      setCertificationForm(prev => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certDescription">Certification Details</Label>
                  <Textarea
                    id="certDescription"
                    value={certificationForm.description}
                    onChange={(e) =>
                      setCertificationForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe the certification, its requirements, and what it validates..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certReason">Reason for Request</Label>
                  <Textarea
                    id="certReason"
                    value={certificationForm.reason}
                    onChange={(e) =>
                      setCertificationForm(prev => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Explain why this certification is important for your career advancement..."
                    required
                  />
                </div>

                <Separator />

                {/* Additional Details Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Additional Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certCareerGoals">Career Goals</Label>
                    <Textarea
                      id="certCareerGoals"
                      value={certificationForm.careerGoals}
                      onChange={(e) =>
                        setCertificationForm(prev => ({ ...prev, careerGoals: e.target.value }))
                      }
                      placeholder="Describe your long-term career goals and how this certification will help achieve them..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certPreviousExperience">Previous Experience</Label>
                    <Textarea
                      id="certPreviousExperience"
                      value={certificationForm.previousExperience}
                      onChange={(e) =>
                        setCertificationForm(prev => ({ ...prev, previousExperience: e.target.value }))
                      }
                      placeholder="Describe any relevant previous experience, education, or certifications in this domain..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certExpectedOutcome">Expected Outcome</Label>
                    <Textarea
                      id="certExpectedOutcome"
                      value={certificationForm.expectedOutcome}
                      onChange={(e) =>
                        setCertificationForm(prev => ({ ...prev, expectedOutcome: e.target.value }))
                      }
                      placeholder="What professional opportunities or skills do you expect to gain from this certification?"
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-muted-foreground">Required Documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Please upload the following documents to support your application:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certAcademicTranscript">Academic Transcript *</Label>
                      <Input
                        id="certAcademicTranscript"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCertificationForm(prev => ({ ...prev, academicTranscript: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certMarksheets">Marksheets/Certificates *</Label>
                      <Input
                        id="certMarksheets"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCertificationForm(prev => ({ ...prev, marksheets: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certBankSlip">Bank Statement/Slip *</Label>
                      <Input
                        id="certBankSlip"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCertificationForm(prev => ({ ...prev, bankSlip: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Financial proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certElectricityBill">Electricity Bill *</Label>
                      <Input
                        id="certElectricityBill"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCertificationForm(prev => ({ ...prev, electricityBill: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Address proof (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certIdCard">National ID/CNIC *</Label>
                      <Input
                        id="certIdCard"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCertificationForm(prev => ({ ...prev, idCard: file }));
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Identity proof (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit Certification Request"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}