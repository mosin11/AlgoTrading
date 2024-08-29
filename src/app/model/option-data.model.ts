// src/app/option-data.model.ts

export interface OptionData {
    symbol: string;
    expdate: string;
    strikeprice: string;
    CallBestBuyQty: string;
    CallBestSellQty: string;
    CallLTP: string;
    CallOI: string;
    CallOIPerChg: string;
    CallOI_Prev: string;
    CallPricePerChange: string;
    CallVolume: string;
    PutBestBuyQty: string;
    PutBestSellQty: string;
    PutLTP: string;
    PutOI: string;
    PutOIPerChg: string;
    PutOI_Prev: string;
    PutPriceperChange: string;
    PutStrikeprice: string;
    PutVolume: string;
    Putbestbuyprice: string;
    Putbestsellprice: string;
    callbestbuyprice: string;
    callbestsellprice: string;
  }

  export interface ExpiryData {
    instType: string;
    readableExpiryDate: string;
    symbol: string;
    strikePrice: string;
  }

  export interface PresentIndexData {
    ftm0: string;
    dtm1: string;
    iv: string;
    ic: string;
    highPrice: string;
    lowPrice: string;
    openingPrice: string;
    mul: string;
    prec: string;
    cng: string;
    nc: string;
    name: string;
    tk: string;
    e: string;
  }
  export interface LiveData {
    ftm0: string;   // Foot Marker 0
    dtm1: string;   // Date Marker 1
    fdtm: string;   // Full Date Time Marker
    ltt: string;    // Last Trade Time
    v: string;      // Volume
    ltp: string;    // Last Trade Price
    ltq: string;    // Last Trade Quantity
    tbq: string;    // Total Bid Quantity
    tsq: string;    // Total Sell Quantity
    bp: string;     // Bid Price
    sp: string;     // Sell Price
    ap: string;     // Ask Price
    lo: string;     // Low Price
    h: string;      // High Price
    lcl: string;    // Lower Control Limit
    ucl: string;    // Upper Control Limit
    op: string;     // Opening Price
    c: string;      // Closing Price
    oi: string;     // Open Interest
    mul: string;    // Multiplier
    prec: string;   // Precision
    cng: string;    // Change
    nc: string;     // New Contract
    to: string;     // Turnover
    name: string;   // Name
    tk: string;     // Token
    e: string;      // Event
    ts: string;     // Timestamp
  }
  
  
  