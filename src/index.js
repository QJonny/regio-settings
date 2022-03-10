"use strict";

const os = require("os");
const dateFormat = require("dateformat");

const stdThSep = "<_th_sep_>";
const stdDecSep = "<_dec_sep_>";

let externalRegeditVBSLocation = null;

function setRegeditExternalVBSLocation(vbsDirectory) {
  externalRegeditVBSLocation = vbsDirectory;
}

function getRegionalSettings(callback) {
  function _getDateOrder(registryConst) {
    switch (registryConst) {
      case 0:
        return ["mm", "dd", "yyyy"];
      case 1:
        return ["dd", "mm", "yyyy"];
      case 2:
        return ["yyyy", "mm", "dd"];
      default:
        return ["dd", "mm", "yyyy"];
    }
  }

  try {
    const regedit = require("regedit");

    if (externalRegeditVBSLocation) {
      regedit.setExternalVBSLocation(externalRegeditVBSLocation);
    }

    regedit.list("HKCU\\Control Panel\\International", (err, entries) => {
      if (err) {
        callback({
          message: "cannot retrieve regional settings from registry",
          inner: err,
        });
      } else {
        const keys = entries["HKCU\\Control Panel\\International"].values;

        callback(null, {
          dateSep: keys.sDate.value,
          dateOrder: _getDateOrder(keys.iDate.value),
          decimalSep: keys.sDecimal.value,
          thousandSep: keys.sThousand.value,
          hourSep: keys.sTime.value,
          digitsNo: keys.iDigits.value,
        });
      }
    });
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

module.exports.setRegeditExternalVBSLocation = setRegeditExternalVBSLocation;
module.exports.getRegionalSettings = getRegionalSettings;
module.exports.getDefaultRegionalSettings = getDefaultRegionalSettings;
module.exports.getFormattedDate = getFormattedDate;
module.exports.getFormattedAmount = getFormattedAmount;
