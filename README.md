# News Feed App

The mobile app fetches the latest news from the internet and displays it to users in real-time. It has a feature where users can pin their favorite articles for easy access. The feed also automatically refreshes every 10 seconds to keep the content up-to-date.

## User Interface

| Home                     | Swipe Actions                     | Pinned Items               |
| ------------------------ | --------------------------------- | -------------------------- |
| ![Home](./docs/home.png) | ![Home](./docs/swipe_actions.png) | ![Home](./docs/pinned.png) |

## Code Navigation

-   The code of **Home Screen** is located at `app/index.tsx`
-   Components used in the app are located at `components/news` folder
-   Database related code is located at `services/dbService.ts` file
-   All project assets are stored at `assets` directory

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
     npm run ios
    ```
