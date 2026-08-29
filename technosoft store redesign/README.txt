WHERE EVERYTHING GOES IN YOUR PROJECT
(your project root = the folder with package.json in it, e.g.
C:\xampp\htdocs\technosoft store redesign\technosoft-store)

App.jsx                  -> src\App.jsx           (overwrite)
components\*.jsx         -> src\components\       (copy both files in)
data\products.js         -> src\data\products.js  (create data folder first)
images\technosoft-logo.png -> public\images\technosoft-logo.png
images\products\*        -> public\images\products\  (all 26 files)

Then run:
  npm install framer-motion
  npm run dev
