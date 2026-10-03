// LocalStorage Game State Persistence Service

const PREFIX = 'masra7_garema_';

export const storage = {
  // Save or update custom imported cases
  getCustomCases() {
    try {
      const data = localStorage.getItem(`${PREFIX}custom_cases`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read custom cases', e);
      return [];
    }
  },

  saveCustomCase(caseObj) {
    try {
      const cases = this.getCustomCases();
      const existingIdx = cases.findIndex(c => c.id === caseObj.id);
      if (existingIdx >= 0) {
        cases[existingIdx] = caseObj;
      } else {
        cases.unshift(caseObj);
      }
      localStorage.setItem(`${PREFIX}custom_cases`, JSON.stringify(cases));
      return cases;
    } catch (e) {
      console.error('Failed to save custom case', e);
      return [];
    }
  },

  deleteCustomCase(caseId) {
    try {
      const cases = this.getCustomCases().filter(c => c.id !== caseId);
      localStorage.setItem(`${PREFIX}custom_cases`, JSON.stringify(cases));
      this.clearCaseState(caseId);
      return cases;
    } catch (e) {
      console.error('Failed to delete custom case', e);
      return [];
    }
  },

  // Game state for a specific case
  getCaseState(caseId) {
    try {
      const data = localStorage.getItem(`${PREFIX}state_${caseId}`);
      if (!data) {
        return this.getDefaultCaseState(caseId);
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read case state', e);
      return this.getDefaultCaseState(caseId);
    }
  },

  getDefaultCaseState(caseId) {
    return {
      caseId,
      unlockedEnvelopes: [1], // Sequential: only Envelope 1 is unlocked initially
      currentEnvelope: 1,
      currentView: 'dossier', // dossier, interrogations, suspects, corkboard, notebook, timeline, solution
      readDocs: [],
      bookmarkedDocs: [],
      askedQuestions: [],
      flaggedContradictions: [],
      suspects: {}, // { [suspectId]: { status: 'UNDER_INVESTIGATION' } }
      hypotheses: [],
      corkboard: { nodes: [], connections: [] },
      timelineEvents: [],
      envelopeGoals: {},
      notes: '',
      solved: false,
      startedAt: Date.now(),
      lastPlayedAt: Date.now(),
      playtimeSeconds: 0
    };
  },

  saveCaseState(caseId, state) {
    try {
      state.lastPlayedAt = Date.now();
      localStorage.setItem(`${PREFIX}state_${caseId}`, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save case state', e);
    }
  },

  clearCaseState(caseId) {
    try {
      localStorage.removeItem(`${PREFIX}state_${caseId}`);
    } catch (e) {
      console.error('Failed to clear case state', e);
    }
  }
};

export const storageService = storage;
export default storage;
