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
  
 
  
  