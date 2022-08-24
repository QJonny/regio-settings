"use strict";

const os = require("os");
const dateFormat = require("dateformat");

const stdThSep = "<_th_sep_>";
const stdDecSep = "<_dec_sep_>";

function getRegionalSettings(callback) {
  function _getDateOrder(registryConst, defaultSettings) {
    switch (registryConst) {
      case 0:
        return ["mm", "dd", "yyyy"];
      case 1:
        return ["dd", "mm", "yyyy"];
      case 2:
        return ["yyyy", "mm", "dd"];
      default:
        return defaultSettings.dateOrder;
    }
  }
  function _getDigitsNo(iDigits, defaultSettings) {
    try {
      return parseInt(iDigits);
    } catch (err) {
      return defaultSettings.digitsNo;
    }
  }

  try {
    const registry = require("node-windows-registry");

    registry.openKey(
      "Control Panel\\International",
      {
        hive: registry.HKEY_CURRENT_USER,
      },
      (err, regKey) => {
        if (err) {
          callback({
            message: "cannot retrieve regional settings from registry",
            inner: err,
          });
        } else {
          regKey.listValues((err2, values) => {
            try {
              regKey.dispose();
            } catch (err3) {
              // ignore
            }
            if (err2) {
              callback({
                message: "cannot retrieve regional settings from registry",
                inner: err2,
              });
            } else {
              const defaultSettings = getDefaultRegionalSettings();

              callback(null, {
                dateSep:
                  values.sDate !== null && values.sDate !== undefined
                    ? values.sDate
                    : defaultSettings.dateSep,
                dateOrder: _getDateOrder(values.iDate, defaultSettings),
                decimalSep:
                  values.sDecimal !== null && values.sDecimal !== undefined
                    ? values.sDecimal
                    : defaultSettings.decimalSep,
                thousandSep:
                  values.sThousand !== null && values.sThousand !== undefined
                    ? values.sThousand
                    : defaultSettings.thousandSep,
                hourSep:
                  values.sTime !== null && values.sTime !== undefined
                    ? values.sTime
                    : defaultSettings.hourSep,
                digitsNo: _getDigitsNo(values.iDigits, defaultSettings),
              });
            }
          });
        }
      }
    );
  } catch (ex) {
    if (ex.code === "MODULE_NOT_FOUND") {
      setImmediate(() =>
        callback({
          message: `operating system (${os.platform()}) unsupported`,
        })
      );
    } else {
      setImmediate(() => callback(ex));
    }
  }
}

function getDefaultRegionalSettings() {
  return {
    dateSep: ".",
    dateOrder: ["dd", "mm", "yyyy"],
    decimalSep: ".",
    thousandSep: " ",
    hourSep: ":",
    digitsNo: 2,
  };
}

function getFormattedDate(date, settings) {
  if (!date || date === "") {
    return "";
  }

  return dateFormat(
    date,
    settings.dateOrder[0] +
      settings.dateSep +
      settings.dateOrder[1] +
      settings.dateSep +
      settings.dateOrder[2]
  );
}

function getFormattedAmount(amount, currency, settings) {
  let _amount = amount || 0;
  let _currency = currency ? currency + " " : "";
  let stdAmount = _amount
    .toLocaleString("en-US", { minimumFractionDigits: settings.digitsNo })
    .replaceAll(",", stdThSep)
    .replace(".", stdDecSep);

  return (
    _currency +
    stdAmount
      .replaceAll(stdThSep, settings.thousandSep)
      .replace(stdDecSep, settings.decimalSep)
  );
}

module.exports.getRegionalSettings = getRegionalSettings;
module.exports.getDefaultRegionalSettings = getDefaultRegionalSettings;
module.exports.getFormattedDate = getFormattedDate;
module.exports.getFormattedAmount = getFormattedAmount;
