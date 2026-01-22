"use client"

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material'

interface Employee {
  _id: string
  name: string
  employeeId: string
  phone?: string
  employeeType: 'permanent' | 'casual'
  hireDate?: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface EmployeeFormData {
  name: string
  employeeId: string
  phone: string
  employeeType: 'permanent' | 'casual'
  hireDate: string
  status: 'active' | 'inactive'
}

const initialFormData: EmployeeFormData = {
  name: '',
  employeeId: '',
  phone: '',
  employeeType: 'permanent',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active'
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employees')
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data)
      } else {
        setError('Failed to fetch employees')
      }
    } catch (error) {
      setError('Error fetching employees')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        employeeId: employee.employeeId,
        phone: employee.phone || '',
        employeeType: employee.employeeType,
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status
      })
    } else {
      setEditingEmployee(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingEmployee(null)
    setFormData(initialFormData)
    setError(null)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const url = editingEmployee 
        ? `/api/employees/${editingEmployee._id}`
        : '/api/employees'
      
      const method = editingEmployee ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        handleCloseDialog()
        fetchEmployees()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Error saving employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/employees/${employee._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        fetchEmployees()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Error deleting employee')
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
        >
          Add Employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Employee Name</strong></TableCell>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Phone Number</strong></TableCell>
              <TableCell><strong>Employee Type</strong></TableCell>
              <TableCell><strong>Hire Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No employees found. Click "Add Employee" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee._id} hover>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.employeeType} 
                      size="small"
                      color={employee.employeeType === 'permanent' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.status} 
                      size="small"
                      color={getStatusColor(employee.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Employee">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(employee)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Employee">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(employee)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Employee Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Employee ID *"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Employee Type</InputLabel>
              <Select
                value={formData.employeeType}
                onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as 'permanent' | 'casual' })}
                label="Employee Type"
              >
                <MenuItem value="permanent">Permanent</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !formData.name || !formData.employeeId}
          >
            {submitting ? <CircularProgress size={20} /> : (editingEmployee ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}