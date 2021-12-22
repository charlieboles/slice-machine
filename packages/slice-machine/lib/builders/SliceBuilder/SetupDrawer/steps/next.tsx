import {
  InstallSliceCanvas,
  CreatePage,
  UpdateSmJson,
  CheckSetup,
} from "./common";

const CreatePageInstructions = {
  code: `import { SliceCanvasRenderer } from "@prismicio/slice-canvas-renderer-react";
import SliceZone from "next-slicezone";

import state from "../.slicemachine/libraries-state.json";

import * as Slices from "../slices";
const resolver = ({ sliceName }) => Slices[sliceName];

const SliceCanvas = () => (<SliceCanvasRenderer
\t// The \`sliceZone\` prop should be a function receiving slices and rendering them using your \`SliceZone\` component.
\tsliceZone={(props) => <SliceZone {...props} resolver={resolver} />}
\tstate={state}
/>);

export default SliceCanvas;`,
  instructions: `In your “pages” directory, create a file called _canvas.jsx and add
the following code. This page is the route you hit to preview and
develop your components.`,
};

export const steps = [
  InstallSliceCanvas({
    code: `npm install --save next-slicezone prismic-reactjs @prismicio/slice-canvas-renderer-react`,
  }),
  CreatePage(CreatePageInstructions),
  UpdateSmJson({}),
  CheckSetup({}),
];
