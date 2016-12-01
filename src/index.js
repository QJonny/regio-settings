'use strict';

const watt = require ('watt');
const os = require ('os');
const dateFormat = require ('dateformat');

const stdThSep = '<_th_sep_>';
const stdDecSep = '<_dec_sep_>';


const getRegionalSettings = watt (function *(next) {
  function _getDateOrder(registryConst) {
    switch (registryConst) {
      case 0:
        return ['mm', 'dd', 'yyyy'];
      case 1:
        return ['dd', 'mm', 'yyyy'];
      case 2:
        return ['yyyy', 'mm', 'dd'];
      default:
        return ['dd', 'mm', 'yyyy'];
    }
  }

  if (os.platform () === 'win32') {
    const regedit = require ('regedit');

    try {
      let entries = yield regedit.list ('HKCU\\Control Panel\\International', next);
      let keys = entries['HKCU\\Control Panel\\International'].values;

      return {
        dateSep: keys.sDate.value,
        dateOrder: _getDateOrder (keys.iDate.value),
        decimalSep: keys.sDecimal.value,
        thousandSep: keys.sThousand.value,
        hourSep: keys.sTime.value,
        digitsNo: keys.iDigits.value
      };
    }
    catch (err) {
      throw {
        message: 'cannot retrieve regional settings from registry',
        inner: err
      };
    }
  }
  else {
    throw {
      message: 'operating system unsupported'
    };
  }
});


function getDefaultRegionalSettings() {
  return {
    dateSep: '.',
    dateOrder: ['dd', 'mm', 'yyyy'],
    decimalSep: '.',
    thousandSep: ' ',
    hourSep: ':',
    digitsNo: 2
  };
}



function getFormattedDate(date, settings) {
  if (date == undefined || date === '') {
    return '';
  }

  return dateFormat(date, settings.dateOrder[0] + settings.dateSep + settings.dateOrder[1] + settings.dateSep + settings.dateOrder[2]);
}


function getFormattedAmount(amount, currency, settings) {
  let _amount = amount || 0;
  let _currency = currency || 'CHF';
  let sign = amount < 0 ? '-' : '';
  let stdAmount = _amount.toLocaleString('en-US', {minimumFractionDigits: settings.digitsNo}).replace (',', stdThSep).replace ('.', stdDecSep);

  return _currency + ' ' + sign + stdAmount.replace (stdThSep, settings.thousandSep).replace (stdDecSep, settings.decimalSep);
}



module.exports.getRegionalSettings = getRegionalSettings;
module.exports.getDefaultRegionalSettings = getDefaultRegionalSettings;
module.exports.getFormattedDate = getFormattedDate;
module.exports.getFormattedAmount = getFormattedAmount;

