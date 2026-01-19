"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ChevronRight } from "lucide-react"

interface DailyProductionFormProps {
  data: any
  onComplete: (data: any) => void
}

const MACHINES = ["Machine A", "Machine B", "Machine C", "Machine D", "Machine E"]

export default function DailyProductionForm({ data, onComplete }: DailyProductionFormProps) {
  const [products, setProducts] = useState(
    data?.products || [{ id: 1, productName: "", quantity: "", unit: "kg", machinesUsed: [], employees: "" }],
  )
  const [qualityIssues, setQualityIssues] = useState(data?.qualityIssues || "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    products.forEach((product, index) => {
      if (!product.productName) newErrors[`product-${index}-name`] = "Required"
      if (!product.quantity) newErrors[`product-${index}-quantity`] = "Required"
      if (product.machinesUsed.length === 0) newErrors[`product-${index}-machines`] = "Select at least one machine"
      if (!product.employees) newErrors[`product-${index}-employees`] = "Required"
    })

    if (products.length === 0) {
      newErrors.products = "Add at least one product"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now(), productName: "", quantity: "", unit: "kg", machinesUsed: [], employees: "" },
    ])
  }

  const removeProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const updateProduct = (id: number, field: string, value: any) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const toggleMachine = (id: number, machine: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const machinesUsed = p.machinesUsed.includes(machine)
            ? p.machinesUsed.filter((m) => m !== machine)
            : [...p.machinesUsed, machine]
          return { ...p, machinesUsed }
        }
        return p
      }),
    )
  }

  const getTotalEfficiency = () => {
    const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
    return products.length > 0 ? ((totalQuantity / (products.length * 100)) * 100).toFixed(1) : "0"
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({
        products,
        qualityIssues,
        overallEfficiency: getTotalEfficiency(),
      })
    }
  }

  return (
    <Card className="border-border/50 animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-primary">Daily Production Data</CardTitle>
        <CardDescription>Enter production metrics with machines and employees per product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">Product Name</label>
                  <Input
                    placeholder="e.g., Widget A, Component B"
                    value={product.productName}
                    onChange={(e) => updateProduct(product.id, "productName", e.target.value)}
                    className={errors[`product-${index}-name`] ? "border-red-500" : ""}
                  />
                  {errors[`product-${index}-name`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`product-${index}-name`]}</p>
                  )}
                </div>
                {products.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity Produced</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, "quantity", e.target.value)}
                    className={errors[`product-${index}-quantity`] ? "border-red-500" : ""}
                  />
                  {errors[`product-${index}-quantity`] && (
                    <p className="text-xs text-red-500">{errors[`product-${index}-quantity`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={product.unit}
                    onChange={(e) => updateProduct(product.id, "unit", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="tonnes">Tonnes (t)</option>
                    <option value="units">Units</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Employees</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={product.employees}
                    onChange={(e) => updateProduct(product.id, "employees", e.target.value)}
                    className={errors[`product-${index}-employees`] ? "border-red-500" : ""}
                  />
                  {errors[`product-${index}-employees`] && (
                    <p className="text-xs text-red-500">{errors[`product-${index}-employees`]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Machines Used</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {MACHINES.map((machine) => (
                    <div
                      key={machine}
                      className="flex items-center space-x-2 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`product-${product.id}-${machine}`}
                        checked={product.machinesUsed.includes(machine)}
                        onCheckedChange={() => toggleMachine(product.id, machine)}
                        className="border-primary"
                      />
                      <label
                        htmlFor={`product-${product.id}-${machine}`}
                        className="text-sm cursor-pointer font-medium"
                      >
                        {machine}
                      </label>
                    </div>
                  ))}
                </div>
                {errors[`product-${index}-machines`] && (
                  <p className="text-xs text-red-500">{errors[`product-${index}-machines`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {errors.products && <p className="text-xs text-red-500">{errors.products}</p>}

        <Button
          onClick={addProduct}
          variant="outline"
          className="w-full gap-2 bg-transparent border-primary/20 hover:bg-primary/5"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Overall Daily Efficiency</p>
          <p className="text-2xl font-bold text-accent">{getTotalEfficiency()}%</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quality Issues (optional)</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Any quality concerns or defects..."
            value={qualityIssues}
            onChange={(e) => setQualityIssues(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
