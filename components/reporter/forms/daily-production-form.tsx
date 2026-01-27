"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Save } from "lucide-react"
import { IMachine } from "@/lib/models"

interface DailyProductionFormProps {
  data: any
  onComplete: (data: any) => void
  previousMeterEnd?: string
}

interface Product {
  id: number
  productName: string
  quantity: string
  unit: string
  machinesUsed: string[]
  employees: string
}

export default function DailyProductionForm({ data, onComplete, previousMeterEnd = "" }: DailyProductionFormProps) {
  const [products, setProducts] = useState<Product[]>(
    data?.products || [{ id: 1, productName: "", quantity: "", unit: "kgs", machinesUsed: [], employees: "" }],
  )
  const [qualityIssues, setQualityIssues] = useState(data?.qualityIssues || "")
  const [kplcMeterStart, setKplcMeterStart] = useState(data?.kplcMeterStart || previousMeterEnd || data?.kplcMeter || "")
  const [kplcMeterEnd, setKplcMeterEnd] = useState(data?.kplcMeterEnd || "")
  const [machines, setMachines] = useState<IMachine[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch machines from database
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/machines')
        if (response.ok) {
          const machinesData = await response.json()
          setMachines(machinesData)
        } else {
          console.error('Failed to fetch machines')
        }
      } catch (error) {
        console.error('Error fetching machines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMachines()
  }, [])

  useEffect(() => {
    setProducts(
      data?.products && data.products.length
        ? data.products
        : [{ id: 1, productName: "", quantity: "", unit: "kgs", machinesUsed: [], employees: "" }],
    )
    setQualityIssues(data?.qualityIssues || "")
    setKplcMeterStart(data?.kplcMeterStart || previousMeterEnd || data?.kplcMeter || "")
    setKplcMeterEnd(data?.kplcMeterEnd || "")
  }, [data, previousMeterEnd])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    products.forEach((product: Product, index: number) => {
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
      { id: Date.now(), productName: "", quantity: "", unit: "kgs", machinesUsed: [], employees: "" },
    ])
  }

  const removeProduct = (id: number) => {
    setProducts(products.filter((p: Product) => p.id !== id))
  }

  const updateProduct = (id: number, field: string, value: any) => {
    setProducts(products.map((p: Product) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const toggleMachine = (id: number, machine: string) => {
    setProducts(
      products.map((p: Product) => {
        if (p.id === id) {
          const machinesUsed = p.machinesUsed.includes(machine)
            ? p.machinesUsed.filter((m: string) => m !== machine)
            : [...p.machinesUsed, machine]
          return { ...p, machinesUsed }
        }
        return p
      }),
    )
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({
        products,
        qualityIssues,
        kplcMeterStart,
        kplcMeterEnd,
      })
    }
  }

  return (
    <div className="bg-transparent animate-in fade-in duration-300 space-y-6">
      <div className="space-y-6">
        <div className="space-y-4">
          {products.map((product: Product, index: number) => (
            <div key={product.id} className="p-4 sm:p-6 border-2 border-green-700 rounded-none space-y-4 bg-background/40 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label htmlFor={`product-name-${product.id}`} className="text-base sm:text-lg font-semibold text-foreground block mb-2">Product Name</label>
                  <div className="rounded-md border border-border bg-white">
                    <select
                      id={`product-name-${product.id}`}
                      value={product.productName}
                      onChange={(e) => updateProduct(product.id, "productName", e.target.value)}
                      className={`w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white ${
                        errors[`product-${index}-name`] ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select product</option>
                      <option value="Bagasse Briquettes">Bagasse Briquettes</option>
                      <option value="Pellets">Pellets</option>
                      <option value="Sawdust Briquettes">Sawdust Briquettes</option>
                    </select>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-base sm:text-lg font-semibold text-foreground">Quantity Produced</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, "quantity", e.target.value)}
                    className={`bg-background/80 backdrop-blur-sm border-2 border-green-700 ${errors[`product-${index}-quantity`] ? "border-red-500" : ""}`}
                  />
                  {errors[`product-${index}-quantity`] && (
                    <p className="text-xs text-red-500">{errors[`product-${index}-quantity`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-base sm:text-lg font-semibold text-foreground">Unit</label>
                  <div className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground">
                    kgs
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-base sm:text-lg font-semibold text-foreground">Number of Employees</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={product.employees}
                    onChange={(e) => updateProduct(product.id, "employees", e.target.value)}
                    className={`bg-background/80 backdrop-blur-sm border-2 border-green-700 ${errors[`product-${index}-employees`] ? "border-red-500" : ""}`}
                  />
                  {errors[`product-${index}-employees`] && (
                    <p className="text-xs text-red-500">{errors[`product-${index}-employees`]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor={`machines-${product.id}`} className="text-lg sm:text-xl font-semibold text-foreground">Machines Used</label>
                {loading ? (
                  <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg backdrop-blur-sm">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Loading machines...</span>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border border-border bg-white">
                      <select
                        id={`machines-${product.id}`}
                        value={product.machinesUsed[0] || ""}
                        onChange={(e) => updateProduct(product.id, "machinesUsed", e.target.value ? [e.target.value] : [])}
                        className="w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
                      >
                        <option value="">Select machine</option>
                        {machines.map((machine) => (
                          <option key={machine._id.toString()} value={machine.name}>
                            {machine.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
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
          className="w-full gap-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 mb-12 py-4 text-lg font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>

        <div className="space-y-2">
          <label className="text-lg sm:text-xl font-semibold text-foreground">
            KPLC Meter Start 
            {previousMeterEnd && <span className="text-xs font-normal text-green-600 ml-2">(Auto-filled from previous end reading)</span>}
          </label>
          <input
            type="text"
            placeholder="Enter start reading"
            value={kplcMeterStart}
            onChange={(e) => setKplcMeterStart(e.target.value)}
            className="w-full px-3 py-2 bg-background/80 backdrop-blur-sm border-2 border-green-700 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            readOnly={!!previousMeterEnd && kplcMeterStart === previousMeterEnd}
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg sm:text-xl font-semibold text-foreground">KPLC Meter End</label>
          <Input
            type="text"
            placeholder="Enter end reading"
            value={kplcMeterEnd}
            onChange={(e) => setKplcMeterEnd(e.target.value)}
            className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg sm:text-xl font-semibold text-foreground">Quality Issues (optional)</label>
          <textarea
            className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Any quality concerns or defects..."
            value={qualityIssues}
            onChange={(e) => setQualityIssues(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} className="bg-primary hover:bg-(--brand-green-dark) text-primary-foreground gap-2 px-8 py-4 text-lg font-semibold">
            Save Draft <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
