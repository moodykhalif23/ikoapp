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
  Person as PersonIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon
} from '@mui/icons-material'

interface Employee {
  _id: string
  name: string
  employeeId: string
  phone?: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface EmployeeFormData {
  name: string
  employeeId: string
  phone: string
  status: 'active' | 'inactive'
}

const initialFormData: EmployeeFormData = {
  name: '',
  employeeId: '',
  phone: '',
  status: 'active'
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
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
        name: employee.name || '',
        employeeId: employee.employeeId || '',
        phone: employee.phone || '',
        status: employee.status || 'active'
      })
    } else {
      setEditingEmployee(null)
      setFormData({ ...initialFormData })
    }
    setDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingEmployee(null)
    setFormData({ ...initialFormData })
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

  const handleImportCsv = async (file: File) => {
    try {
      setImporting(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message || 'Employees imported successfully')
        await fetchEmployees()
      } else {
        setError(data.error || 'Failed to import employees')
      }
    } catch (error) {
      setError('Error importing employees')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = [
      'Name,Employee ID,Phone',
      'John Doe,EMP001,0712345678'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'employees-template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={2}
      >
        <Typography variant="h5" component="h1" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          <PersonIcon />
          Employee Management
        </Typography>
        <Box
          display="grid"
          gap={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, auto)' }
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: '#2e7d32', 
              '&:hover': { bgcolor: '#1b5e20' },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.75, sm: 0.85 }
            }}
            size="small"
            fullWidth
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Add Employee
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Add
            </Box>
          </Button>
          <input
            id="employee-csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImportCsv(file)
              }
              e.currentTarget.value = ''
            }}
          />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{ 
              bgcolor: '#2e7d32', 
              '&:hover': { bgcolor: '#1b5e20' },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.75, sm: 0.85 }
            }}
            size="small"
            fullWidth
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Download CSV Template
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Template
            </Box>
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => {
              const input = document.getElementById('employee-csv-upload') as HTMLInputElement | null
              input?.click()
            }}
            sx={{ 
              bgcolor: '#2e7d32', 
              '&:hover': { bgcolor: '#1b5e20' },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.75, sm: 0.85 }
            }}
            size="small"
            disabled={importing}
            fullWidth
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {importing ? 'Importing...' : 'Import CSV'}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {importing ? 'Importing' : 'Import'}
            </Box>
          </Button>
        </Box>
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

      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ minWidth: 120 }}><strong>Name</strong></TableCell>
              <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}><strong>Employee ID</strong></TableCell>
              <TableCell sx={{ minWidth: 120, display: { xs: 'none', md: 'table-cell' } }}><strong>Phone</strong></TableCell>
              <TableCell sx={{ minWidth: 80 }}><strong>Status</strong></TableCell>
              <TableCell sx={{ minWidth: 100 }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No employees found. Click "Add Employee" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {employee.name}
                      </Typography>
                      {/* Show employee ID on mobile */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: { xs: 'block', sm: 'none' } }}
                      >
                        ID: {employee.employeeId}
                      </Typography>
                      {/* Show phone on mobile */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: { xs: 'block', md: 'none' } }}
                      >
                        {employee.phone || 'No phone'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {employee.employeeId}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {employee.phone || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.status} 
                      size="small"
                      color={getStatusColor(employee.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(employee)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(employee)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
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
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Employee Name *"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="medium"
            />
            
            <TextField
              label="Employee ID *"
              value={formData.employeeId || ''}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              fullWidth
              size="medium"
            />
            
            <TextField
              label="Phone Number"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              size="medium"
            />
            
            <FormControl fullWidth size="medium">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} size="medium">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !formData.name?.trim() || !formData.employeeId?.trim()}
            size="medium"
          >
            {submitting ? <CircularProgress size={20} /> : (editingEmployee ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
