import { useState } from "react";
import { Button, Input, Image, Card, CardFooter, CardBody } from "@nextui-org/react";
import axios from "axios";
import { Toaster, toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const handleSubmit = (img, setImages) => {
  if (img !== undefined && img !== null && img !== "") {
    axios({
      method: "post",
      url: `${API_URL}/${img.name}`,
      data: img,
      headers: {
        "Content-Type": img.type,
      },
    })
      .then((response) => {
        setImages((old) => [response.data.url, ...old]);
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
  const [images, setImages] = useState([]);

  console.log(images);

  return (
    <div className="">
      <div className="flex flex-col items-center justify-top min-h-screen py-2 my-16">
        <Toaster position="top-right" richColors />

        <div className="w-8/12">
          <div className="flex flex-col items-center justify-center">
            <Input
              type="file"
              variant="underlined"
              onChange={(e) => setImg(e.target.files[0])}
              accept="image/*"
            />
            <Button
              type="submit"
              className="mt-6"
              onClick={() => handleSubmit(img, setImages)}
            >
              Submit
            </Button>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 p-6 my-4">
          {images.map((image, index) => (
            <Card
              className="m-2 p-1"
            >
              <CardBody
                className="flex justify-center items-center"
              >
                <Image
                  key={index}
                  src={image}
                  width={200}
                  height={200}
                  className="mb-4"
                />
              </CardBody>
              <CardFooter
                className="flex justify-center items-center"
              >
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(image);
                  }}
                >
                  Copy URL
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
