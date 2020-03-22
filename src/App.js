import React, { useState } from 'react';
import InputNumber from './InputNumber';
import styles from './App.module.scss';
import pkg from '../package.json';

function App() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [grid, setGrid] = useState(
    Array(height)
      .fill()
      .map((row) => Array(width).fill(0))
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
  const [tool, setTool] = useState(1);

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

  const nearest = (x, y, type, path = []) => {
    const [lastX, lastY] = path[path.length - 1];
    const was = {};
    Object.entries(adjacent(x, y, type))
  };

  // Calculate score
  let score = 0;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        score += 10;
        // TODO: Find route to nearest forest
        console.log(adjacent(x, y, 0));
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
                  style={style}
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
