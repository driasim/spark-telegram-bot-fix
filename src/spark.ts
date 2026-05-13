/**
 * Launch-safe Spark status helpers.
 *
 * The older local Spark dashboard/API is intentionally out of the launch path.
 * Keep these commands non-networked until the new dashboard contract is ready.
 */

const DASHBOARD_DEFERRED =
  [
    '⚠️ Legacy dashboard commands are paused for launch v1.',
    '',
    'Ready now',
    '• Telegram chat and command routing',
    '• Builder memory when the local bridge is healthy',
    '• Spawner mission relay when local services are running',
    '',
    'Next move: use /status, /diagnose, /run, or /board.'
  ].join('\n');

export const spark = {
  /**
   * Spark itself is available when the bot process is running. Legacy dashboard
   * health is no longer used as the source of truth.
   */
  async isAvailable(): Promise<boolean> {
    return true;
  },

  /**
   * Format a quick launch status summary.
   */
  async getQuickStatus(): Promise<string> {
    return [
      '✅ Spark Telegram launch core is online.',
      '',
      'Ready now',
      '• Chat and command routing through Telegram',
      '• Builder memory when the local bridge is healthy',
      '• Spawner mission relay when local services are running',
      '',
      'Paused',
      '• Legacy resonance/dashboard commands',
      '',
      'Next move: use /status for live health or /run <goal> for missions.'
    ].join('\n');
  },

  async getResonance(): Promise<string> {
    return DASHBOARD_DEFERRED;
  },

  async getInsights(_limit = 5): Promise<string> {
    return DASHBOARD_DEFERRED;
  },

  async getSurprises(): Promise<string> {
    return DASHBOARD_DEFERRED;
  },

  async processQueue(): Promise<string> {
    return DASHBOARD_DEFERRED;
  },

  async reflect(): Promise<string> {
    return DASHBOARD_DEFERRED;
  },
};
