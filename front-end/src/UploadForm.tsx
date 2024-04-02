import { ChangeEvent, useState } from "react"
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
    Detection,
    detectObjects,
    getLastDetections,
    getProcessedVideo,
    uploadFile
} from "./services/apiService";


interface UploadFileProps {
    videoFile: File | null
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
    onVideoProcessed: (inProcess: boolean) => void
    onVideoOutput: (video: string) => void
    onLastDetections: (detections: Detection[] | null) => void
    inProcess: boolean

}

const UploadForm = ({ videoFile,
    onFileChange,
    onVideoProcessed,
    onVideoOutput,
    onLastDetections,
    inProcess }: UploadFileProps) => {


    const [confidence, setConfidence] = useState<number>(0.7)
    const [iou, setIOU] = useState<number>(0.5)


    const handleConfidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
        const confidenceValue = parseFloat(event.target.value)
        if (isNaN(confidenceValue) || confidenceValue < 0 || confidenceValue > 1) return
        setConfidence(confidenceValue)
        console.log(confidenceValue)
    }

    const handleIOUChange = (event: ChangeEvent<HTMLInputElement>) => {
        const iouValue = parseFloat(event.target.value)
        if (isNaN(iouValue) || iouValue < 0 || iouValue > 1) return
        setIOU(iouValue)
        console.log(iouValue)
    }

    const handleUpload = async () => {
        try {
            if (!videoFile) {
                throw new Error('No input video.');
            }
            onVideoProcessed(true)
            await uploadFile(videoFile)
            const processedVideoPath = await detectObjects(confidence, iou)
            if (!processedVideoPath) {
                throw new Error('Error in process the video in server.');
            }
            const videoBlobURL = await getProcessedVideo(processedVideoPath)
            onVideoOutput(videoBlobURL);
            const lastDetections = await getLastDetections()
            onVideoProcessed(false)
            onLastDetections(lastDetections);


        } catch (error) {
            onVideoProcessed(false)
            if (axios.isAxiosError(error) && error.response) {
                toast.error("Error uploading file:" + error.response.data.message);
            } else {
                toast.error((error as Error).message);
            }
            throw error;

        }
    }


    return (
        <div className="flex place-content-center gap-3 mt-3" >

            <div className="grid grid-cols-4 gap-x-3 min-w-40  w-full">
                <Label className="">Choose the video</Label>
                <Label className="">Confidence</Label>
                <Label className="col-span-2">IOU</Label>
                <Input
                    type="file"
                    onChange={onFileChange}
                    required
                />
                <Input
                    type="number"
                    placeholder="confidence"
                    value={confidence}
                    onChange={handleConfidenceChange}
                    required
                />
                <Input
                    type="number"
                    placeholder="iou"
                    value={iou}
                    onChange={handleIOUChange}
                    required
                />
                <Button onClick={handleUpload} disabled={inProcess} >Detect Objects</Button>
            </div>

            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    )

}

export default UploadForm