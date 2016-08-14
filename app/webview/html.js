import DeviceOrientationControls from '../lib/DeviceOrientationControls';
import RenderScene from './RenderScene';
import base64 from './base64';
import Projector from './Projector';
import THREEx from './threex.objcoord';

const html =
`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>neARby</title>
      <meta charset="utf-8">
      <meta name="viewport" content="user-scalable=no, initial-scale=1">
      <style>
       body {
         margin: 0px;
         background-color: #000000;
         overflow: hidden;
         background-color: transparent;
       }

       #info {
         position: absolute;
         top: 0px; width: 100%;
         color: #ffffff;
         padding: 5px;
         font-family:Monospace;
         font-size:13px;
         font-weight: bold;
         text-align:center;
       }

       a {
         color: #ff8800;
       }
      </style>
    </head>
    <body>

      <div id="container"></div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js"></script>
      ${DeviceOrientationControls};
      ${base64};
      ${Projector};
      ${THREEx};
      ${RenderScene};
    </body>
  </html>
`;

export default html;
