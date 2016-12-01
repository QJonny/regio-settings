'use strict';

import {expect} from 'chai';
import {
  getRegionalSettings,
  getDefaultRegionalSettings,
  getFormattedDate,
  getFormattedAmount
} from '../src/index.js';


describe ('Cultura -> retrieve', function () {
  it ('RETRIEVE_SETTINGS', function () {
    getRegionalSettings ((err, settings) => {
      expect (err).to.equal (undefined);
      expect (Object.keys (settings)).to.have.length (6);
    });
  });

  it ('RETRIEVE_DEFAULT', function () {
    const settings = getDefaultRegionalSettings ();
    expect (settings.dateSep).to.equal ('.');
  });
});

describe ('Cultura -> format', function () {
  it ('FORMAT_AMOUNT', function () {
    const settings = getDefaultRegionalSettings ();
    const formattedAmount = getFormattedAmount (-1230.50, 'EUR', settings);

    expect (formattedAmount).to.equal ('EUR -1 230.50');
  });

  it ('FORMAT_DATE', function () {
    const settings = getDefaultRegionalSettings ();
    const formattedDate = getFormattedDate (new Date(2016, 4, 20), settings);

    expect (formattedDate).to.equal ('20.05.2016');
  });
});
