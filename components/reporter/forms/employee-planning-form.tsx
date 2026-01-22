"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, Users } from "lucide-react"

interface EmployeePlanningFormProps {
  data: any
  onComplete: (data: any) => void
  onSubmit: () => void
}

export default function EmployeePlanningForm({ data, onComplete, onSubmit }: EmployeePlanningFormProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(data?.selectedEmployees || [])
  const [loading, setLoading] = useState(true)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [formData, setFormData] = useState({
    employeesPresent: data?.employeesPresent || "",
    employeesAbsent: data?.employeesAbsent || "",
    plannedShifts: data?.plannedShifts || "",
    notes: data?.notes || "",
    selectedEmployees: data?.selectedEmployees || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch employees from database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (response.ok) {
          const employeesData = await response.json()
          setEmployees(employeesData)
        } else {
          console.error('Failed to fetch employees')
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Update employee count when selection changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      employeesPresent: selectedEmployees.length.toString(),
      selectedEmployees: selectedEmployees
    }))
  }, [selectedEmployees])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (selectedEmployees.length === 0) newErrors.employeesPresent = "Please select at least one employee"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleEmployeeDialogClose = () => {
    setShowEmployeeDialog(false)
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData)
      // Small delay to show completion animation
      setTimeout(onSubmit, 500)
    }
  }

  return (
    <Card className="border-border/50 animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-primary">Employee Planning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employees Present</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0"
                value={selectedEmployees.length}
                InputProps={{ readOnly: true }}
                className={`flex-1 ${errors.employeesPresent ? "border-red-500" : ""}`}
              />
              <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Users size={16} />
                    Select
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Present Employees</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Loading employees...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-4">
                          Selected: {selectedEmployees.length} of {employees.length} employees
                        </div>
                        {employees.map((employee) => (
                          <div
                            key={employee._id}
                            className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={employee._id}
                              checked={selectedEmployees.includes(employee._id)}
                              onCheckedChange={() => toggleEmployee(employee._id)}
                              className="border-primary"
                            />
                            <label htmlFor={employee._id} className="text-sm cursor-pointer font-medium flex-1">
                              {employee.name}
                              {employee.position && (
                                <span className="text-xs text-muted-foreground block">
                                  {employee.position}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedEmployees([])}
                            className="flex-1"
                          >
                            Clear All
                          </Button>
                          <Button
                            onClick={handleEmployeeDialogClose}
                            className="flex-1"
                          >
                            Done
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {errors.employeesPresent && <p className="text-xs text-red-500">{errors.employeesPresent}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employees Absent</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.employeesAbsent}
              onChange={(e) => setFormData({ ...formData, employeesAbsent: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Planned Shifts</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.plannedShifts}
            onChange={(e) => setFormData({ ...formData, plannedShifts: e.target.value })}
          >
            <option value="">Select shift configuration</option>
            <option value="single">Single Shift</option>
            <option value="double">Double Shift</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Any employee planning notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Report Summary</p>
          <ul className="text-sm space-y-1 text-foreground">
            <li>✓ All 5 sections will be completed</li>
            <li>✓ Report ready for submission</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onComplete} className="flex-1 bg-transparent">
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Check className="w-4 h-4" />
            Submit Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
