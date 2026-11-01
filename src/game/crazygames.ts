/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Official CrazyGames SDK v3 Helper
declare global {
  interface Window {
    CrazyGames?: {
      SDK?: {
        init: () => Promise<void>;
        game: {
          gameplayStart: () => void;
          gameplayStop: () => void;
          happyTime: () => void;
        };
        ad: {
          requestAd: (
            type: 'midgame' | 'rewarded',
            callbacks?: {
              adStarted?: () => void;
              adFinished?: () => void;
              adError?: (error: unknown) => void;
            }
          ) => Promise<void>;
        };
        banner: {
          requestBanner: (params: { id: string; width: number; height: number }) => void;
          clearBanner: (id: string) => void;
        };
      };
    };
  }
}

class CrazyGamesBridge {
  private initialized = false;

  public async init() {
    if (this.initialized) return;
    try {
      if (window.CrazyGames?.SDK) {
        await window.CrazyGames.SDK.init();
        this.initialized = true;
        console.log('CrazyGames SDK v3 initialized successfully');
      }
    } catch (err) {
      console.warn('CrazyGames SDK init skipped or running standalone:', err);
    }
  }

  public gameplayStart() {
    try {
      window.CrazyGames?.SDK?.game?.gameplayStart();
    } catch (e) {
      // safe fallback
    }
  }

  public gameplayStop() {
    try {
      window.CrazyGames?.SDK?.game?.gameplayStop();
    } catch (e) {
      // safe fallback
    }
  }

  public happyTime() {
    try {
      window.CrazyGames?.SDK?.game?.happyTime();
    } catch (e) {
      // safe fallback
    }
  }

  public requestMidgameAd(onComplete?: () => void) {
    try {
      if (window.CrazyGames?.SDK?.ad) {
        window.CrazyGames.SDK.ad.requestAd('midgame', {
          adFinished: () => onComplete?.(),
          adError: () => onComplete?.(),
        });
      } else {
        onComplete?.();
      }
    } catch (e) {
      onComplete?.();
    }
  }

  public requestRewardedAd(onReward: () => void, onError?: () => void) {
    try {
      if (window.CrazyGames?.SDK?.ad) {
        window.CrazyGames.SDK.ad.requestAd('rewarded', {
          adFinished: () => onReward(),
          adError: (err) => {
            console.warn('Ad skipped/error, granting reward anyway:', err);
            onReward();
          },
        });
      } else {
        // Standalone fallback: grant reward directly
        onReward();
      }
    } catch (e) {
      onReward();
    }
  }
}

export const crazyGames = new CrazyGamesBridge();
