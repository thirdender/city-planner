import React, { useState } from 'react';
import InputNumber from './InputNumber';
import styles from './App.module.scss';
import pkg from '../package.json';

function App() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [grid, setGrid] = useState(
    (() => {
      const g = Array(height)
        .fill()
        .map((row) => Array(width).fill(0))
      g[2][2] = 1;
      return g;
    })()
  );

  // Store selected tool
  const tools = [
    {
      key: 1,
      name: 'House',
      image: 'house.png',
    },
    {
      key: 2,
      name: 'Tree',
      image: 'tree.png',
    },
    {
      key: 3,
      name: 'Store',
      image: 'store.png',
    },
    {
      key: 0,
      name: 'Road',
      image: 'road-straight.png',
    },
  ];
  const [tool, setTool] = useState(2);

  // Add columns to the grid if needed
  if (width < grid[0].length) {
    setGrid(grid.map((row) => row.slice(0, width)));
  } else if (width > grid[0].length) {
    grid.map((row) => {
      while (row.length < width) {
        row.push(0);
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
      grid.push(Array(grid[0].length).fill(0));
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
  const visited = Array(height)
    .fill()
    .map((row) => Array(width).fill(false));
  // Find the shorted path from x, y to a cell of type `target`
  const walk = (sx, sy, target) => {
    // Track visited locations
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
        if (cell === 0 || (steps > 0 && cell === target)) {
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

    if (reachedEnd) {
      return steps;
    }
  };

  // Calculate score
  let score = 0;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        // Find route to nearest forest
        const distanceToForest = walk(x, y, 2);
        if (distanceToForest && distanceToForest > 1) {
          score += 10 - (distanceToForest - 1);
        }
      }
    });
  });

  // filter: hue-rotate(285deg)

  return (
    <div className={styles.App}>
      <div className={styles.Body}>
        <div className={styles.Grid} style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
          { grid.map((row, y) =>
            row.map((cell, x) => {
              let src;
              let alt;
              let style;
              switch (cell) {
                case 1: {
                  alt = 'House';
                  src = 'house.png';
                  break;
                }
                case 2: {
                  alt = 'Tree';
                  src = 'tree.png';
                  break;
                }
                case 3: {
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
                  } = adjacent(x, y, 0);
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
                  style={{ ...style, filter: visited[y][x] ? 'hue-rotate(285deg)' : '' }}
                />
                : <span />
            })
          ) }
        </div>
      </div>
      <div className={styles.Sidebar}>
        <h2>Score</h2>
        <div className={styles.Box}>
          {score}
        </div>

        <h2>Width</h2>
        <div className={styles.Box}>
          <InputNumber defaultValue={width} onChange={setWidth} />
        </div>

        <h2>Height</h2>
        <div className={styles.Box}>
          <InputNumber defaultValue={height} onChange={setHeight} />
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
              />
            )) }
            <span>{ tools.find((item) => item.key === tool).name }</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
