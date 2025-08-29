// Stars reward system data
let stars = [];
let starHistory = [];

// Initialize stars for existing users
const initializeStarsForUser = (userId, teamId) => {
  const existingStar = stars.find(star => star.userId === userId);
  if (!existingStar) {
    stars.push({
      id: `star_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      teamId: teamId,
      totalStars: 0,
      earnedStars: 0,
      spentStars: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

// Add stars to a user
const addStars = (userId, amount, reason, givenBy) => {
  const starRecord = stars.find(star => star.userId === userId);
  if (starRecord) {
    starRecord.totalStars += amount;
    starRecord.earnedStars += amount;
    starRecord.updatedAt = new Date().toISOString();
    
    // Add to history
    starHistory.push({
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      amount: amount,
      reason: reason,
      givenBy: givenBy,
      type: 'earned',
      createdAt: new Date().toISOString()
    });
    
    return starRecord;
  }
  return null;
};

// Spend stars (for future use)
const spendStars = (userId, amount, reason) => {
  const starRecord = stars.find(star => star.userId === userId);
  if (starRecord && starRecord.totalStars >= amount) {
    starRecord.totalStars -= amount;
    starRecord.spentStars += amount;
    starRecord.updatedAt = new Date().toISOString();
    
    // Add to history
    starHistory.push({
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      amount: amount,
      reason: reason,
      type: 'spent',
      createdAt: new Date().toISOString()
    });
    
    return starRecord;
  }
  return null;
};

// Reset all stars (admin function)
const resetAllStars = () => {
  stars.forEach(star => {
    star.totalStars = 0;
    star.earnedStars = 0;
    star.spentStars = 0;
    star.updatedAt = new Date().toISOString();
  });
  
  // Add reset to history
  starHistory.push({
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'reset',
    reason: 'System reset by admin',
    createdAt: new Date().toISOString()
  });
};

// Get user stars
const getUserStars = (userId) => {
  return stars.find(star => star.userId === userId);
};

// Get all stars for a team
const getTeamStars = (teamId) => {
  return stars.filter(star => star.teamId === teamId);
};

// Get star history for a user
const getUserStarHistory = (userId) => {
  return starHistory.filter(history => history.userId === userId);
};

// Get all star history for a team
const getTeamStarHistory = (teamId) => {
  const teamUserIds = stars.filter(star => star.teamId === teamId).map(star => star.userId);
  return starHistory.filter(history => 
    teamUserIds.includes(history.userId) || history.type === 'reset'
  );
};

module.exports = {
  stars,
  starHistory,
  initializeStarsForUser,
  addStars,
  spendStars,
  resetAllStars,
  getUserStars,
  getTeamStars,
  getUserStarHistory,
  getTeamStarHistory
};
