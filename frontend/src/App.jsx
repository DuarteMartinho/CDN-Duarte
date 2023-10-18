import { useState } from "react";
import { Button, Input, Image } from "@nextui-org/react";
import axios from "axios";
import { Toaster, toast } from "sonner";

const handleSubmit = (img, setImg) => {
  if (img !== undefined && img !== null && img !== "") {
    axios({
      method: "post",
      url: `http://localhost:4444/api/` + img.name,
      data: img,
      headers: {
        "Content-Type": img.type,
      },
    })
      .then(() => {
        toast.success("Image uploaded successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error uploading image!");
      });
  } else {
    toast.error("No image selected!");
  }
};

function App() {
  const [img, setImg] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster position="top-right" richColors />
      <div className="w-8/12">
        <div className="flex flex-col items-center justify-center">
          <Input
            type="file"
            variant="underlined"
            onChange={(e) => setImg(e.target.files[0])}
            accept="image/*"
          />
          <Image src={img} />
          <Button
            type="submit"
            className="mt-6"
            onClick={() => handleSubmit(img, setImg)}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
