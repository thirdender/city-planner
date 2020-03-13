import React, { useState } from 'react';
import InputNumber from './InputNumber';
import styles from './App.module.scss';

function App() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [grid, setGrid] = useState(
    Array(height)
      .fill()
      .map((row) => Array(width).fill(0))
  );

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
    newGrid[y][x] = (grid[y][x] + 1) % 3;
    setGrid(newGrid);
  };

  // Calculate score
  let score = 0;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        score += 10;
      }
    });
  });

  return (
    <div className={styles.App}>
      <div className={styles.Body}>
        <div className={styles.Grid} style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
          { grid.map((row, y) =>
            row.map((cell, x) => {
              let src;
              let alt;
              let title;
              let style;
              switch (cell) {
                case 1:
                  alt = 'House';
                  src = '/house.png';
                  break;
                case 2:
                  alt = 'Tree';
                  src = '/tree.png';
                  break;
                default:
                  alt = 'Road';
                  // Count roads around this road
                  let around = 0;
                  for (let i = Math.max(0, y - 1), yMax = Math.min(height, y + 2); i < yMax; i++) {
                    for (let j = Math.max(0, x - 1), xMax = Math.min(width, x + 2); j < xMax; j++) {
                      if (i === y && j === x) {
                        continue;
                      }
                      if (grid[i][j] === 0) {
                        around += 1;
                      }
                    }
                  }
                  const roadIsNorth = y > 0 && grid[y - 1][x] === 0;
                  const roadIsEast = x > 0 && grid[y][x - 1] === 0;
                  const roadIsSouth = y + 1 < height && grid[y + 1][x] === 0;
                  const roadIsWest = x + 1 < width && grid[y][x + 1] === 0;
                  const orthogonallyAdjacentRoads = (roadIsNorth ? 1 : 0)
                    + (roadIsWest ? 1 : 0)
                    + (roadIsSouth ? 1 : 0)
                    + (roadIsEast ? 1 : 0);
                  title = orthogonallyAdjacentRoads;
                  if (orthogonallyAdjacentRoads === 4) {
                    // This is a four-way intersection
                    src = '/road-four-way.png';
                  } if (orthogonallyAdjacentRoads === 1) {
                    // This is a dead-end
                    src = '/road-dead-end.png';
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
                    src = '/road-straight.png';
                    if (roadIsNorth) {
                      style = { transform: 'rotate(90deg)' };
                    }
                  } else if (orthogonallyAdjacentRoads === 2) {
                    // This road is a curve
                    src = '/road-curve.png';
                    if (roadIsNorth && roadIsEast) {
                      style = { transform: 'rotate(180deg)' };
                    } else if (roadIsNorth) {
                      style = { transform: 'rotate(270deg)' };
                    } else if (roadIsEast) {
                      style = { transform: 'rotate(90deg)' };
                    }
                  } else if (orthogonallyAdjacentRoads === 3) {
                    // This road is a t-intersection
                    src = '/road-t.png';
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
              console.log(src);
              return src
                ? <img
                  key={`${x},${y}/${width}x${height}`}
                  onClick={() => toggle(x, y)}
                  src={src}
                  alt={alt}
                  title={title}
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
      </div>
    </div>
  );
}

export default App;
