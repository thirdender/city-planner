import React, { useEffect, useState } from 'react';
import InputNumber from './InputNumber';
import styles from './App.module.scss';
import pkg from '../package.json';

// Sigmoid function, constrains a number between 0 and 1
const sig = (x) => 1 / (1 + Math.E ** -x);
// Decimal to sigmoid, constrains values of 0 and Infinity to between 0 and 1
const decimalSig = (x) => (sig(x * Math.E) - 0.5) * 2;

const HOUSE = 1;
const TREE = 2;
const STORE = 3;
const ROAD = 4;

function App() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);

  const createEmptyGrid = ({ fill }) =>
    Array(height)
      .fill()
      .map(() => Array(width).fill(fill))

  const [grid, setGrid] = useState(
    (() => {
      const g = createEmptyGrid({ fill: ROAD });
      g[2][2] = 1;
      return g;
    })()
  );

  // Store selected tool
  const tools = [
    {
      key: HOUSE,
      name: 'House',
      image: 'house.png',
    },
    {
      key: TREE,
      name: 'Tree',
      image: 'tree.png',
    },
    {
      key: STORE,
      name: 'Store',
      image: 'store.png',
    },
    {
      key: ROAD,
      name: 'Road',
      image: 'road-straight.png',
    },
  ];
  const [tool, setTool] = useState(TREE);
  useEffect(() => {
    const handler = (event) => {
      const key = Number(event.key);
      if (key < 5) {
        setTool(key);
      }
    };
    document.body.addEventListener('keypress', handler);
    return () => {
      document.body.removeEventListener('keypress', handler);
    };
  }, []);

  // Add columns to the grid if needed
  if (width < grid[0].length) {
    setGrid(grid.map((row) => row.slice(0, width)));
  } else if (width > grid[0].length) {
    grid.map((row) => {
      while (row.length < width) {
        row.push(ROAD);
      }
      return row;
    });
    setGrid(grid);
  }

  // Add rows to the grid if needed
  if (height < grid.length) {
    setGrid(grid.slice(0, height));
  } else if (height > grid.length) {
    while (grid.length < height) {
      grid.push(Array(grid[0].length).fill(ROAD));
    }
    setGrid(grid);
  }

  const toggle = (x, y) => {
    const newGrid = [...grid];
    newGrid[y][x] = tool;
    setGrid(newGrid);
  };

  const adjacent = (x, y, type) => ({
    north: y > 0 && grid[y - 1][x] === type,
    east: x > 0 && grid[y][x - 1] === type,
    south: y + 1 < height && grid[y + 1][x] === type,
    west: x + 1 < width && grid[y][x + 1] === type,
  });

  // Vectors to adjacent cells
  const dx = [0, 0, +1, -1];
  const dy = [-1, +1, 0, 0];
  // Find the shorted path from x, y to a cell of type `target`
  const walk = (sx, sy, target) => {
    // Track visited locations
    const visited = createEmptyGrid({ fill: false });
    const xq = [];
    const yq = [];
    // Mark initial position as visited
    xq.push(sx);
    yq.push(sy);
    visited[sy][sx] = true;
    // Track number of steps taken
    let steps = 0;
    let reachedEnd = false;
    let nodesLeftInLayer = 1;
    let nodesInNextLayer = 0;

    let x, y;

    // Function to explore neighboring cells
    const exploreNeighbors = () => {
      for (let i = 0; i < 4; i++) {
        // Adjacent coordinates
        const xx = x + dx[i];
        const yy = y + dy[i];
        // Continue if adjacent coordinates are out of bounds
        if (xx === -1 || yy === -1) continue;
        if (xx === width || yy === height) continue;
        // Skip visited locations
        if (visited[yy][xx]) continue;
        // Only add roads or target cells to the queue
        const cell = grid[yy][xx];
        if (cell === ROAD || (steps > 0 && cell === target)) {
          xq.push(xx);
          yq.push(yy);
          visited[yy][xx] = true;
          nodesInNextLayer += 1;
        }
      }
    }

    while (xq.length) {
      x = xq.shift();
      y = yq.shift();
      if (grid[y][x] === target) {
        reachedEnd = true;
        break;
      }
      exploreNeighbors();
      nodesLeftInLayer -= 1;
      if (nodesLeftInLayer === 0) {
        nodesLeftInLayer = nodesInNextLayer;
        nodesInNextLayer = 0;
        steps += 1;
      }
    }

    // Return visited spaces and number of steps to the nearest cell of type 
    // `target`. If a path cannot be found, `steps` will be false.
    if (!reachedEnd) {
      steps = false;
    }
    return {
      visited,
      steps,
    };
  };

  // Track score for forests
  const findAdjacentForests = (x, y) => {
    for (let i = 0; i < 4; i++) {
      // Adjacent coordinates
      const xx = x + dx[i];
      const yy = y + dy[i];
      // Continue if adjacent coordinates are out of bounds
      if (xx === -1 || yy === -1) continue;
      if (xx === width || yy === height) continue;
      // Skip visited locations
      if (visitedForests[yy][xx]) continue;
      // Continue checking adjacent cells if this is a forest
      if (grid[yy][xx] === TREE) {
        visitedForests[yy][xx] = true;
        numberTrees += 1;
        findAdjacentForests(xx, yy);
      }
    }
  };
  const visitedForests = createEmptyGrid({ fill: false });
  let numberTrees = 0;
  let numberForests = 0;

  // Calculate scores
  const footsteps = createEmptyGrid({ fill: 0 });
  const stepsFromHouse = createEmptyGrid({});
  let score = 0;
  let houses = 0;
  let stores = 0;
  let stepsToForests = 0;
  let stepsToStores = 0;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      switch (cell) {
        case HOUSE: {
          houses += 1;
          score += 10;
          stepsFromHouse[y][x] = {
            stepsToForests: 5,
            stepsToStores: 5,
          };
          // Find route to nearest forest
          const { visited: visitedToForests, steps: distanceToForest } = walk(x, y, TREE);
          if (distanceToForest && distanceToForest > 1) {
            const houseToForest = Math.min(distanceToForest - 1, 5);
            score -= houseToForest;
            stepsToForests += houseToForest;
            stepsFromHouse[y][x].stepsToForests = houseToForest;
            console.log(houseToForest);
          } else {
            stepsToForests += 5;
            score -= 5;
          }
          // Find route to nearest store
          const { visited: visitedToStores, steps: distanceToStore } = walk(x, y, STORE);
          if (distanceToStore && distanceToStore > 1) {
            const houseToStore = Math.min(distanceToStore - 1, 5);
            score -= houseToStore;
            stepsToStores += houseToStore;
            stepsFromHouse[y][x].stepsToStores = houseToStore;
          } else {
            stepsToStores += 5;
            score -= 5;
          }
          // Mark footsteps on the map
          for (let xx = 0; xx < width; xx += 1) {
            for (let yy = 0; yy < height; yy += 1) {
              if (distanceToForest && visitedToForests[yy][xx]) {
                footsteps[yy][xx] += 1;
              }
              if (distanceToStore && visitedToStores[yy][xx]) {
                footsteps[yy][xx] += 1;
              }
            }
          }
          break;
        }
        case TREE: {
          // If this tree is not in a previously visited forest, explore forest
          if (!visitedForests[y][x]) {
            visitedForests[y][x] = true;
            numberForests += 1;
            numberTrees += 1;
            findAdjacentForests(x, y);
          }
          break;
        }
        case STORE: {
          // Track score for stores
          score -= 5;
          stores += 1;
          break;
        }
        default: {
          // THE GOGGLES DO NOTHING
        }
      }
    });
  });

  // Calculate total score for forests
  if (numberTrees > 0) {
    score += Math.floor(numberTrees / numberForests);
  }

  return (
    <div className={styles.App}>
      <div className={styles.Body}>
        <div className={styles.Grid} style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
          { grid.map((row, y) =>
            row.map((cell, x) => {
              let src;
              let alt;
              let style;
              let title;
              switch (cell) {
                case HOUSE: {
                  alt = 'House';
                  src = 'house.png';
                  title = `${stepsFromHouse[y][x].stepsToForests} steps to forest, ${stepsFromHouse[y][x].stepsToStores} steps to store`;
                  break;
                }
                case TREE: {
                  alt = 'Tree';
                  src = 'tree.png';
                  break;
                }
                case STORE: {
                  alt = 'Store';
                  src = 'store.png';
                  break;
                }
                default: {
                  alt = 'Road';
                  // Count roads around this road
                  const {
                    north: roadIsNorth,
                    east: roadIsEast,
                    south: roadIsSouth,
                    west: roadIsWest,
                  } = adjacent(x, y, ROAD);
                  const orthogonallyAdjacentRoads = (roadIsNorth ? 1 : 0)
                    + (roadIsWest ? 1 : 0)
                    + (roadIsSouth ? 1 : 0)
                    + (roadIsEast ? 1 : 0);
                  if (orthogonallyAdjacentRoads === 4) {
                    // This is a four-way intersection
                    src = 'road-four-way.png';
                  } if (orthogonallyAdjacentRoads === 1) {
                    // This is a dead-end
                    src = 'road-dead-end.png';
                    if (roadIsWest) {
                      style = { transform: 'rotate(270deg)' };
                    } else if (roadIsNorth) {
                      style = { transform: 'rotate(180deg)' };
                    } else if (roadIsEast) {
                      style = { transform: 'rotate(90deg)' };
                    }
                  } else if (orthogonallyAdjacentRoads === 2 &&
                    ((roadIsNorth && roadIsSouth) || (roadIsEast && roadIsWest))) {
                    // This road is a straight line
                    src = 'road-straight.png';
                    if (roadIsNorth) {
                      style = { transform: 'rotate(90deg)' };
                    }
                  } else if (orthogonallyAdjacentRoads === 2) {
                    // This road is a curve
                    src = 'road-curve.png';
                    if (roadIsNorth && roadIsEast) {
                      style = { transform: 'rotate(180deg)' };
                    } else if (roadIsNorth) {
                      style = { transform: 'rotate(270deg)' };
                    } else if (roadIsEast) {
                      style = { transform: 'rotate(90deg)' };
                    }
                  } else if (orthogonallyAdjacentRoads === 3) {
                    // This road is a t-intersection
                    src = 'road-t.png';
                    if (roadIsNorth && roadIsEast && roadIsSouth) {
                      style = { transform: 'rotate(90deg)' };
                    } else if (roadIsNorth && !roadIsEast) {
                      style = { transform: 'rotate(270deg)' };
                    } else if (!roadIsSouth) {
                      style = { transform: 'rotate(180deg)' };
                    }
                  }
                  break;
                }
              }
              return src
                ? <img
                  key={`${x},${y}/${width}x${height}`}
                  onClick={() => toggle(x, y)}
                  src={`${pkg.homepage}/${src}`}
                  alt={alt}
                  title={title}
                  style={{
                    ...style,
                    filter: footsteps[y][x]
                      ? `hue-rotate(${decimalSig(footsteps[y][x] / 4) * -75}deg)`
                      : ''
                  }}
                />
                : <span />
            })
          ) }
        </div>
      </div>
      <div className={styles.Sidebar}>
        <h2>Score</h2>
        <div className={styles.Box}>
          <div title="10 points per house">Houses: { houses * 10 }</div>
          <div
            title={`${numberTrees} tree${numberTrees === 1 ? '' : 's'}, divided by ${numberForests} forest${numberForests === 1 ? '' : 's'}`}
          >
            Forests: { numberTrees ? Math.floor(numberTrees / numberForests) : 0 }
          </div>
          <div title="-5 points per store">Stores: { stores * -5 }</div>
          <div title="-1 point for each step needed to travel from a house to forests and stores">
            Travel:
              <div> &nbsp; to forests: { stepsToForests }</div>
              <div> &nbsp; to stores: { stepsToStores }</div>
          </div>
          <div style={{ marginTop: '2px', borderTop: '2px solid' }}>Total: { score }</div>
        </div>

        <h2>Tool</h2>
        <div className={styles.Box}>
          <div className={styles.Tools}>
            { tools.map(({ key, name, image }) => (
              <img
                src={`${pkg.homepage}/${image}`}
                alt={name}
                onClick={() => setTool(key)}
                key={key}
                className={key === tool ? styles.Selected : undefined}
                title={`Press ${key} to select`}
              />
            )) }
            <span>{ tools.find((item) => item.key === tool).name }</span>
          </div>
        </div>

        <h2>Width</h2>
        <div className={styles.Box}>
          <InputNumber defaultValue={width} onChange={setWidth} />
        </div>

        <h2>Height</h2>
        <div className={styles.Box}>
          <InputNumber defaultValue={height} onChange={setHeight} />
        </div>
      </div>
    </div>
  );
}

export default App;
