import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { prepareImage } from "../src/prepareImage";
import {ChangeEvent, useEffect} from "react";

export default {
  title: 'Woodtime/prepareImage'
} as Meta;

const Template: Story = (args) => {
  const [image, setImage] = React.useState<File|null>(null)
  const originalRef = React.useRef<HTMLCanvasElement>()
  const transformedRef = React.useRef<HTMLCanvasElement>()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files[0])
  }

  useEffect(() => {
    if (!image) {
      return
    }

    const img = new Image
    img.onload = () => {
      const originalCanvas = originalRef.current
      const transformedCanvas = transformedRef.current

      originalCanvas.getContext('2d').drawImage(img, 0, 0)

      const ctx = transformedCanvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      prepareImage(ctx)
    }
    img.src = URL.createObjectURL(image)
  }, [originalRef, transformedRef, image])

  return (
    <div {...args}>
      <input type='file' onChange={handleChange} />

      {image && (
        <div>
          <canvas id='original' width={400} height={300} ref={originalRef} />
          <canvas id='transformed' width={400} height={300} ref={transformedRef} />
        </div>
      )}
    </div>
  )
}

export const Default = Template.bind({});
Default.args = {
};
