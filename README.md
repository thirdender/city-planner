# City Planner

This was a fun little project I did for a math teacher friend of mine for a black lives matter week lesson. It was an object lesson regarding green space access inequities in cities. Activist urban planners realized by designing parks "inefficiently" they could actually increase access to green spaces. Normally in area optimization, square is better, but long thin rectangles actually have the benefit of expanded access. This demo allowed the students in the class to discover that on their own. The city layout is scored on the following criteria:

* Houses in the city are worth 10 points, but...
* -1 point each step between a house and a forest, and...
* -1 point each step between a house and a store
* Each store is -5 points
* The points for forests are calculated as the total number of trees divided by the number of individual forests

The project is hosted on my personal website at [https://thirdender.io/city-planner/](https://thirdender.io/city-planner/)


## Building and modifying the project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
