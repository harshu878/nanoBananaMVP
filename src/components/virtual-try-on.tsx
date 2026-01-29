"use client"

import { useState, useRef } from "react"
import { Upload, Shirt, User, Sparkles, Download, Image as ImageIcon, Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Outfit {
  id: string
  name: string
  image: string // In a real app, this would be a path to an asset
  type: "pre-made" | "custom"
}

const PREMADE_OUTFITS: Outfit[] = [
  { id: "suit", name: "Business Suit", image: "/outfits/suit.jpg", type: "pre-made" },
  { id: "hawaiian", name: "Hawaiian + Shorts", image: "/outfits/hawaiian.jpg", type: "pre-made" },
  { id: "blazer", name: "Party Blazer", image: "/outfits/blazer.jpg", type: "pre-made" },
  { id: "sherwani", name: "Sherwani", image: "/outfits/sherwani.jpg", type: "pre-made" },
  { id: "casual", name: "T-Shirt + Jeans", image: "/outfits/casual.jpg", type: "pre-made" },
]

export default function VirtualTryOn() {
  const [userImage, setUserImage] = useState<string | null>(null)
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectionMode, setSelectionMode] = useState<"deck" | "grid" | "selected">("deck")
  
  const userFileInputRef = useRef<HTMLInputElement>(null)
  const garmentFileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "user" | "garment") => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === "user") {
          setUserImage(e.target?.result as string)
        } else {
          setGarmentImage(e.target?.result as string)
          setSelectedOutfitId("custom-upload")
          setSelectionMode("selected")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOutfitSelect = (outfit: Outfit) => {
    setSelectedOutfitId(outfit.id)
    setGarmentImage(outfit.image)
    setSelectionMode("selected")
  }

  const resetSelection = () => {
    setSelectionMode("grid")
    setSelectedOutfitId(null)
    setGarmentImage(null)
  }

  const handleGenerate = async () => {
    if (!userImage || !garmentImage) {
      toast.error("Please upload a user photo and select an outfit")
      return
    }

    setIsGenerating(true)
    setResultImage(null)

    try {
      // Call our API route
      const response = await fetch("/api/try-on", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_image: userImage,
                garment_image: garmentImage,
              }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Generation failed")
            }
            
            if (data.error) throw new Error(data.error)
      
      if (data.warning) {
        toast.warning(data.warning)
      } else {
        toast.success("Try-on complete!")
      }

      setResultImage(data.result_url)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate try-on. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50 p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shirt className="h-5 w-5 md:h-6 md:w-6" /> Virtual Try-On
        </h1>
        <Badge variant="outline" className="text-xs">Phase 1 MVP</Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1 min-h-0">
        {/* Left Column: Inputs */}
        <div className="flex flex-row md:flex-col gap-2 md:gap-4 min-w-0 order-2 md:order-1 h-[40%] md:h-auto w-full md:w-7/12 lg:w-1/2">
          
          {/* User Photo */}
          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden w-1/2 md:w-full">
            <CardContent className="p-2 md:p-4 flex flex-col h-full gap-2">
              <div className="flex items-center justify-between shrink-0">
                <Label className="font-semibold flex items-center gap-2 text-xs md:text-sm">
                  <User className="h-3 w-3 md:h-4 md:w-4" /> Photo
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => userFileInputRef.current?.click()}
                  className="h-6 md:h-8 text-[10px] md:text-xs px-2"
                >
                  <Upload className="h-3 w-3 mr-1" /> Upload
                </Button>
                <Input 
                  ref={userFileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, "user")}
                />
              </div>
              
              <div 
                className="flex-1 bg-neutral-100 rounded-md border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:bg-neutral-200/50 transition-colors"
                onClick={() => userFileInputRef.current?.click()}
              >
                {userImage ? (
                  <img src={userImage} alt="User" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-neutral-400 p-2">
                    <User className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-1 opacity-50" />
                    <p className="text-[10px] md:text-sm">Full body photo</p>
                    <p className="text-[8px] md:text-[10px] opacity-70">Click to upload</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outfit Selection */}
          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden w-1/2 md:w-full">
            <CardContent className="p-2 md:p-4 flex flex-col h-full gap-2">
              <div className="flex items-center justify-between shrink-0">
                <Label className="font-semibold flex items-center gap-2 text-xs md:text-sm">
                  <Shirt className="h-3 w-3 md:h-4 md:w-4" /> Outfit
                </Label>
                {selectionMode === "selected" ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetSelection}
                      className="h-6 md:h-8 text-[10px] md:text-xs px-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Change
                    </Button>
                ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => garmentFileInputRef.current?.click()}
                      className="h-6 md:h-8 text-[10px] md:text-xs px-2"
                    >
                      <Upload className="h-3 w-3 mr-1" /> Custom
                    </Button>
                )}
                <Input 
                  ref={garmentFileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, "garment")}
                />
              </div>

              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {selectionMode === "deck" && (
                    <motion.div 
                      key="deck"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectionMode("grid")}
                    >
                       {/* Stack Effect */}
                       <div className="relative w-32 h-40 md:w-40 md:h-52">
                          {[2, 1, 0].map((index) => (
                            <div 
                              key={index}
                              className="absolute inset-0 bg-white border-2 border-neutral-200 rounded-lg shadow-md transform transition-transform"
                              style={{ 
                                top: -index * 4, 
                                left: -index * 4,
                                zIndex: 10 - index,
                                rotate: index * 3 + 'deg'
                              }}
                            >
                                <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                    <Shirt className="h-8 w-8 text-neutral-300" />
                                </div>
                            </div>
                          ))}
                          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                              <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                                Tap to Choose Outfit
                              </span>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {selectionMode === "grid" && (
                    <motion.div 
                      key="grid"
                      className="absolute inset-0 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 gap-2 content-start"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { 
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                      }}
                    >
                      {PREMADE_OUTFITS.map((outfit) => (
                        <motion.button
                          key={outfit.id}
                          onClick={() => handleOutfitSelect(outfit)}
                          variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1 }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative aspect-[3/4] rounded-md overflow-hidden border-2 border-transparent hover:border-neutral-200 bg-white shadow-sm"
                        >
                          <img 
                            src={outfit.image} 
                            alt={outfit.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] md:text-[10px] p-1 truncate">
                            {outfit.name}
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {selectionMode === "selected" && (
                    <motion.div 
                      key="selected"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                         <div className="relative aspect-[3/4] h-full max-h-full rounded-md overflow-hidden border-2 border-black ring-4 ring-black/5 shadow-xl">
                            <img 
                              src={garmentImage || ""} 
                              alt="Selected Outfit" 
                              className="w-full h-full object-cover"
                            />
                             <div className="absolute top-2 right-2">
                                <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full shadow-lg">
                                    Selected
                                </span>
                             </div>
                         </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result */}
        <Card className="flex-1 min-w-0 border-neutral-200 shadow-lg flex flex-col order-1 md:order-2 h-[60%] md:h-auto w-full md:w-5/12 lg:w-1/2">
          <CardContent className="p-2 md:p-4 flex flex-col h-full">
            <div className="flex items-center justify-between shrink-0 mb-2 md:mb-4">
              <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                <Sparkles className="h-4 w-4" /> Result
              </Label>
              <Button 
                disabled={!resultImage}
                size="sm"
                onClick={() => {
                  if (resultImage) {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = 'try-on-result.png';
                    link.click();
                  }
                }}
                className="h-7 md:h-9 text-xs"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" /> <span className="hidden md:inline">Download</span>
              </Button>
            </div>

            <div className="flex-1 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden relative">
              {isGenerating ? (
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin mx-auto mb-2 md:mb-4" />
                  <p className="animate-pulse text-sm md:text-base">Generating...</p>
                  <p className="text-[10px] md:text-xs text-neutral-400 mt-1 md:mt-2">Taking 30-60s</p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-neutral-600">
                  <ImageIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-2 md:mb-4 opacity-20" />
                  <p className="text-sm md:text-base">Ready to generate</p>
                </div>
              )}
            </div>

            <Button 
              className="mt-2 md:mt-4 w-full text-xs md:text-sm h-8 md:h-10" 
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !userImage || !garmentImage}
            >
              {isGenerating ? "Processing..." : "✨ Generate Try-On"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
