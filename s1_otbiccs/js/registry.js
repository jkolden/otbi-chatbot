'use strict';

module.exports = {
    components: {
      'executeiBot': require('./components/intelligence/executeiBot'),
      'supplierBalances': require('./components/intelligence/supplierBalances'),
      'logon': require('./components/intelligence/logon'),
      'budgetReport' : require('./components/intelligence/budgetReport'),
      'budgetSurplus' : require('./components/intelligence/budgetSurplus'),
      'budgetAdjustment' : require('./components/intelligence/budgetAdjustment'),
      'getInstanceDetails' : require('./components/intelligence/getInstanceDetails'),
      'logoff' : require('./components/intelligence/logoff')
  }
};
