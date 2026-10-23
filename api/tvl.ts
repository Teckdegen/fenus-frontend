// Vercel serverless function — protocol TVL for tokenized RWA assets.
// GET /api/tvl
// Reads totalSupply() + decimals() for every tokenized asset in a single
// Multicall3 request (LitVM), prices only the tokens that have supply using
// Yahoo Finance, and values the minted supply at that price. Sum = TVL.
//
// Token list must stay in sync with src/lib/tokenRegistry.ts.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPublicClient, http, formatUnits, encodeFunctionData, decodeFunctionResult, type Address } from 'viem';

export const config = { maxDuration: 30 };

const RPC = 'https://liteforge.rpc.caldera.xyz/http';
const MULTICALL3: Address = '0xcA11bde05977b3631167028862bE2a173976CA11';

const TOKENS: { symbol: string; address: Address }[] = [
  { symbol: 'AAPL',    address: '0x9bEb10a55eA6576F34BE6cEa9dAFdFEfa72aB84c' },
  { symbol: 'MSFT',    address: '0x857595bE1f8aD7599BAB7379ef4880c21c91DFad' },
  { symbol: 'GOOGL',   address: '0x03631d2eEb6DD518731B2802a6d4f3D0De57CD66' },
  { symbol: 'AMZN',    address: '0xB950B64DD89B56bF2B5FC43a2C6703fB46F3aa4e' },
  { symbol: 'META',    address: '0xcaaBCc7380936778D0A87E32fD8C8341aA248D87' },
  { symbol: 'NVDA',    address: '0xbd297294820666b391AeDE51248880E31f908170' },
  { symbol: 'TSLA',    address: '0x60Ef1aE026bE8C44e791B31aA0C3be67bE8B72E6' },
  { symbol: 'AMD',     address: '0x1aE03b0C8560c03C50e0d9d8Cfa6737Ab944836b' },
  { symbol: 'INTC',    address: '0x16FAc5F7A3be300986720409aDb8970eC7F975Ff' },
  { symbol: 'MU',      address: '0x5CcB2Df49f8B4958de9884edA2dee3f35F59ce7B' },
  { symbol: 'ORCL',    address: '0x3A114302c954ea5AF9819508db5d0Cf06c65d8Af' },
  { symbol: 'CRWV',    address: '0xF2b4af32A41495eA593C65E0D5A00be93a862fA2' },
  { symbol: 'SNDK',    address: '0x5cC6A6388b1d129774eDd7412cD213e6C720717a' },
  { symbol: 'PLTR',    address: '0xee00fd606521950349568Cb69b849Ae592da3642' },
  { symbol: 'COIN',    address: '0x8e21dcE732A313a6460A1BAb630FB4a306Aa3915' },
  { symbol: 'CRCL',    address: '0x01E164937012DF0ce57DCcA70dC846ee85D66F97' },
  { symbol: 'BABA',    address: '0xb65D951C69a8CC55095749dDb05996D976055F51' },
  { symbol: 'BE',      address: '0xf8d15aB6aeC236511b8D8e704C56923452cb6f84' },
  { symbol: 'SPCX',    address: '0x06Ec44e313F36Bb814B8C10478BCcd6F61D40E02' },
  { symbol: 'USAR',    address: '0xE096C716b00113397A78Ed35cDbF1FB4bDfEF91e' },
  { symbol: 'QQQ',     address: '0xD4C0A6E902158EE7F68b06962653c68283d88dDf' },
  { symbol: 'SPY',     address: '0x4DbEA5D8de706665c5997ef4a6C9033c9e1Fda3D' },
  { symbol: 'SGOV',    address: '0x231ce1B7996846Ffd95981c6cB42cbD987D327B0' },
  { symbol: 'SLV',     address: '0xd58c4f9800D272A1D4B6628C7275266dc226ea36' },
  { symbol: 'NFLX',    address: '0xB045bE4f90d707307f6a7cAA2fA4bea79aF4FEe7' },
  { symbol: 'AVGO',    address: '0x5711eecb4043192c8f9C04C83229EdDB04AC3f16' },
  { symbol: 'SMCI',    address: '0x2e224Af5477ef15C52C6c15b6A50831a706677C3' },
  { symbol: 'RKLB',    address: '0x2a893F8794177acb2ce7eeFD72CFf5F25112D1Ab' },
  { symbol: 'MSTR',    address: '0x53237eD3E91af7fBA33F8F8c6802e9949E846374' },
  { symbol: 'AAOI',    address: '0x4344A0C3A47b7602C2B878BCDB3201F7B1bB134d' },
  { symbol: 'ABCL',    address: '0x1c30327f3fba38ECBfC0905fC2483dc4aA9902F3' },
  { symbol: 'ADBE',    address: '0x07AB86a926bF4eBf8DE9B31B477C06314F666d7D' },
  { symbol: 'AEHR',    address: '0x0523417c20a97F941e743f585980Ca5cfF4099C3' },
  { symbol: 'AEIS',    address: '0x3EB23E0031E4d4ada22B3931010667AEdecd89FD' },
  { symbol: 'ALAB',    address: '0x08422AF38Bf5aA7c11cf287f7320e053d49fF86D' },
  { symbol: 'AMAT',    address: '0x2B0006dA5d489E95cbaC33Ae2B498DE9711781Ba' },
  { symbol: 'AMBA',    address: '0x8580FacBfe7A7FDe935b8706786CE182EcA792af' },
  { symbol: 'AMC',     address: '0x4D9b213D9bF385e7e25e1db7Bc5d01994A46AF42' },
  { symbol: 'AMKR',    address: '0x32F50201e04bc337AB17bB93E766eA77beAf774A' },
  { symbol: 'ANET',    address: '0xeabD80F93640A59dD4A14627E5bAd14Bb41D01B9' },
  { symbol: 'APLD',    address: '0xC271A4Bed445Af85f3B30e0B0737f6c8a380047E' },
  { symbol: 'APP',     address: '0xcd750002e8f155B6B5a3EB0A217A8997d8aeDA4D' },
  { symbol: 'ASML',    address: '0xF928cEF6285f30E8233ee165a8D736Cd2777F963' },
  { symbol: 'ASTS',    address: '0x68aC6b4E675701E5d1859D5a428021b54C7dA506' },
  { symbol: 'AUR',     address: '0x82c354DA58a4FC4FFE7DeCa6138bAF2ed77C6f02' },
  { symbol: 'AVAV',    address: '0x02Cbb29581B7039A1901d0b627f3a4313Fa513F2' },
  { symbol: 'AXON',    address: '0x9011D2E71bE0cE244A7eEDc20FE0046d4223d168' },
  { symbol: 'AXTI',    address: '0x35459907CFdbfE6CAA5a369927E56A39df2d692b' },
  { symbol: 'BA',      address: '0x5800e44589A55ff0a5a9Ef355000cA3119E7e46d' },
  { symbol: 'BB',      address: '0xe5fBE2d543cA0b510428C453d839C715AFeF9AAA' },
  { symbol: 'BND',     address: '0xCc8D09428795aFBCF46987F7308722FEBd966b35' },
  { symbol: 'BULL',    address: '0xBb8D2a913790578458F27b1de7B5E6b5C2d1781c' },
  { symbol: 'CBRS',    address: '0x80ef427B14A885B0a8138286D5d2DA09B31Cb988' },
  { symbol: 'CCL',     address: '0x9389CA1773f4cad4Af196E3b090E4016aDB9e3B6' },
  { symbol: 'CEG',     address: '0xd47E2cB6333A5B072bEEA3BEa4DC551eC8233b2B' },
  { symbol: 'CELH',    address: '0xa2E08DD60b35585aFcBeb9a49a1714f5A8337c50' },
  { symbol: 'CIEN',    address: '0x591A730d7cB713d5aEB5871bA584B8e562dAe832' },
  { symbol: 'CLOV',    address: '0x549C31da4a93bB238331f415478767c458B030e8' },
  { symbol: 'CLS',     address: '0xB043965A5e7263f139dE86B6016aa272039243b4' },
  { symbol: 'CLSK',    address: '0xBE3eDE229Eb060C0D7A11637d18965f91A805d70' },
  { symbol: 'COHR',    address: '0x4A43D12b703554DBf021ece6f240cf7a27f2f250' },
  { symbol: 'COST',    address: '0x3d232f01dDFFeED75fCF3b24db44459F0e0DEFa8' },
  { symbol: 'CRDO',    address: '0x3a380367E9C6678a99fDd2CD305f1848345434a7' },
  { symbol: 'CRM',     address: '0xa01f72e2002e6e3eA03DEd20e7506EFadd9EAc97' },
  { symbol: 'CRWD',    address: '0x1d211c53E7AEE74042505372aAc82cE3a4A123Fd' },
  { symbol: 'CSCO',    address: '0x9BE8fc2fd3eede0B4cb650311D9D284F95a77eeB' },
  { symbol: 'CTSH',    address: '0xca0Ad7D69F9Dc5225CC04F5443622C858a6a710e' },
  { symbol: 'CVNA',    address: '0x0a13Fa611B0c71744Dd10C607A9b6B8200b41b2C' },
  { symbol: 'DDOG',    address: '0x3fc0219e877CaE81F83c27Dc7Cb43211b5Ea5Bd9' },
  { symbol: 'DELL',    address: '0x9a9B0d15c6feE09E72e5D6d542c8987BB4f5A834' },
  { symbol: 'DJT',     address: '0x13DaA39dF9894F91DaE913D933e6316E218B4E68' },
  { symbol: 'DOCN',    address: '0x9F0e5A66cbe987Bdb7d75E78084fAc6AE5fec8B5' },
  { symbol: 'ELF',     address: '0x1D0AF96a13aCe405578B0CCea71353c4453Bcf67' },
  { symbol: 'EWT',     address: '0x56D54a7064d8248b85C94D02F98101b1aB6c34eF' },
  { symbol: 'EWY',     address: '0xA7AC31958aB2d846178d04B1DE8D15C47f4a8c0b' },
  { symbol: 'F',       address: '0x327D9CddE145B49f21371356871b4F1Bf243464d' },
  { symbol: 'FICO',    address: '0x6C05b6ba0B77f76DA0ce7f42ad30E7B048e8E7BE' },
  { symbol: 'FIG',     address: '0x9A72dbb3B0555FE70C0DdA75fcd61c0f466c5089' },
  { symbol: 'FISV',    address: '0xDD63713D11F24fcdb4597207ab9e5CEDdB80d2dD' },
  { symbol: 'FIX',     address: '0x27bf9e22b1F1077d90771B11cEe4558db69B92c8' },
  { symbol: 'FLNC',    address: '0xc67Def4843008C93ec5b1a58d7CA646dF9048CE6' },
  { symbol: 'FLY',     address: '0x30764908E6F24db1eCA95801677eD232AE6aFB0c' },
  { symbol: 'FTNT',    address: '0x2a6aFbeB3c4Ff5910636FBB974861dd0AF9e36E3' },
  { symbol: 'FUTU',    address: '0xE17cb2DB61f3FedD81eF1bC9094B126bD7b3c6d7' },
  { symbol: 'GE',      address: '0xfFC531926C00AD6B67FE8effDfb7ABE707652CfF' },
  { symbol: 'GEV',     address: '0xBbf213f443cFdBac2B96636f25400a26360BE94C' },
  { symbol: 'GLD',     address: '0xe3C10A07d3BC7A97f8B29b2E79196C53De7eBa5b' },
  { symbol: 'GLW',     address: '0x4D11eC1C4875559Aee0Ae902Fb40a68beC443B85' },
  { symbol: 'GLXY',    address: '0xbBCc894F1a509057c30B5F385f242CeF38E8888a' },
  { symbol: 'GME',     address: '0x5b9c64bD088061261783Cb7eDBAa3A37a3fc7c26' },
  { symbol: 'HII',     address: '0xA799b0f0DFabe5425782DA7E87A87d90E15803a9' },
  { symbol: 'HIMS',    address: '0x92930efB021b434dC7A42729da59496c13eA3bC0' },
  { symbol: 'HPE',     address: '0xF1CDfD0F20Af7CA7E6c706DD2c40ff113072845d' },
  { symbol: 'HWM',     address: '0xcA1a5a0320Fa9BA26913052f229f19120ec6cE26' },
  { symbol: 'IBM',     address: '0xa7dFD187BfC139E0033145CDc494B9803618fA54' },
  { symbol: 'IBRX',    address: '0xF70579E07751cAef997e9781CEDD303f35De74b8' },
  { symbol: 'INDA',    address: '0xae9187cC2AF8De24A20C10ac3a57D26f35388C91' },
  { symbol: 'INFQ',    address: '0xF24F9ec407AAfB4dd182673892eA9FB31C5D6e78' },
  { symbol: 'INOD',    address: '0xD2F0d4881D2531b4ca0C673987B148c90E2Fb55e' },
  { symbol: 'INTU',    address: '0xb4De97f09d5771a3218314e3F716B959456bbdc4' },
  { symbol: 'IONQ',    address: '0xD9FAC3DFf6440a499b08e17249B532298D04887b' },
  { symbol: 'IREN',    address: '0x2F2d2E7b6797Ec3926860DCADDefe7582b3808b5' },
  { symbol: 'JBL',     address: '0xE421B487244279e6c3A8D5E3c78f3cdc212d0DF1' },
  { symbol: 'JNJ',     address: '0xab098eB17502Af6FB11d2A475729B76F3a2A782b' },
  { symbol: 'JOBY',    address: '0x4f57B281F9B51bad636FDa1E12A61F43754Fc6c9' },
  { symbol: 'KLAC',    address: '0xA82bc8833bAD66E0bB54CC41B4Fa748429dD6284' },
  { symbol: 'KSS',     address: '0xb17fB97ea4A0fFdb8036972a42eD85BdCd242E80' },
  { symbol: 'KTOS',    address: '0xC1AAb5d3d2Ab9087A1e18124b374b7ab2bf4C3ce' },
  { symbol: 'LHX',     address: '0x6e517018EcEA633776f0d14FF5BC97692ce043E0' },
  { symbol: 'LITE',    address: '0x82b5738B0fe280E29FFeC59a85DAc60f57D468E9' },
  { symbol: 'LLY',     address: '0xF5cc201d0bEedA115b8587c0C12433a0F45BB69F' },
  { symbol: 'LMT',     address: '0x754243d72a946A8F5B4B9f25f15e06BA908680b1' },
  { symbol: 'LRCX',    address: '0x9e398b873441577e3334744128D417EFCa127Dff' },
  { symbol: 'LULU',    address: '0x53cfDe62a75A886b79e360cA3aA3E748A84C36e3' },
  { symbol: 'LUNR',    address: '0x8C16d4033153A5d13ef9ce2EED27CA05d4cB4FDA' },
  { symbol: 'MDB',     address: '0xA9f254F53B9c3866D58269074df490063C0ACCc7' },
  { symbol: 'MOD',     address: '0x2D7b39d1Fc51Af32418F5F7a8671400A09a9F85a' },
  { symbol: 'MPWR',    address: '0x9413c99C88b72Da2B8375907A103ca2B3163AFd3' },
  { symbol: 'MRNA',    address: '0x8031Ee817c6F49CA3B817227c188da56d8737792' },
  { symbol: 'MRVL',    address: '0x3DCDe5dE5CBc188C5513c41bab1634b74e189d8d' },
  { symbol: 'MTSI',    address: '0x24f0CB8AD306E6C25717BA26259AFAf0948cDadc' },
  { symbol: 'MXL',     address: '0x5460f45021cF734a679075e49277d35d5C1FB5d1' },
  { symbol: 'NAVN',    address: '0x7BA72718b3fd5700Becd8A4965bADF81C5A5e9eb' },
  { symbol: 'NBIS',    address: '0xE77b776640EDFdd6ad9eF5818EFE9a1Ceb6671aB' },
  { symbol: 'NET',     address: '0x9EE19f9d681286c81567424F74189Fe236C6ff2E' },
  { symbol: 'NNE',     address: '0x185DCf727818c6A616589F816c06ea909Cb6562b' },
  { symbol: 'NOW',     address: '0xd91ce0d9d87351391F280e374365251EBBa27694' },
  { symbol: 'NU',      address: '0x1b70c409F79D800843547bC81fF2fE5cce96Da9E' },
  { symbol: 'NVTS',    address: '0x1ce8C87C4ea5a0981d31134a941e56E61862EefF' },
  { symbol: 'OKLO',    address: '0xF3347d8365f56a3e596D8f848B281D77AE4D9E92' },
  { symbol: 'ON',      address: '0xf6c2A9d4a53d4A5C9Ca89EDC5ACEd7149641bfDf' },
  { symbol: 'ONTO',    address: '0x89831Ed7A9Be2AdD109f042Fe7294aeAE0b31a92' },
  { symbol: 'OUST',    address: '0xE18AeaCCc6054D108e7b5FF32A2cd4F52C5CB2b9' },
  { symbol: 'P',       address: '0x2F8d1B0e9c529aB412B30D80b94Fe351AcCc6e2D' },
  { symbol: 'PANW',    address: '0x02c8A110daECe0514CE66172343cC6684eEFb8B4' },
  { symbol: 'PATH',    address: '0xc55B02f126e44b21Fc97F7B63d6AD410bD489D62' },
  { symbol: 'PENG',    address: '0x04c47073af6D9B16d7494534a54629D8e35E994A' },
  { symbol: 'PFE',     address: '0x64f157c671748EBB4a3c2f6B0Cc81D32340a975F' },
  { symbol: 'PL',      address: '0xFC2c9613facf19cCA118980B26aa2Cd98754AA7d' },
  { symbol: 'POET',    address: '0x24267678fdD5F6dfD5c5b262B8132577e6F8789B' },
  { symbol: 'POWL',    address: '0x5116D9e84D9EA04434507A288291104bDDD3f816' },
  { symbol: 'PR',      address: '0x1291f6B9a324829A4cfBb7A7e68BDd810Da8BA75' },
  { symbol: 'PWR',     address: '0x0dD1Be66569C72197aB4599ef5881A876C457538' },
  { symbol: 'QBTS',    address: '0x91dbD8014b15932FBA133D700361306842C0065a' },
  { symbol: 'QCOM',    address: '0x74520e52a1D74334fEFd1bc00347Bf2Db479fC47' },
  { symbol: 'QUBT',    address: '0x5DD6f42d6b0eD4258FC43a0765A1b24b2F4f7723' },
  { symbol: 'RBLX',    address: '0x57E18dB4eB011b7ae9eFe5640732018E68EE062f' },
  { symbol: 'RCAT',    address: '0xF0A690e9Be69BbE493b65A0eC5E0daFCfAC46458' },
  { symbol: 'RDDT',    address: '0x1eADDaDE1e6765e80846A769c7677de0DeEaB671' },
  { symbol: 'RDW',     address: '0x74C47eA47B0B2EA19dFfF8272c956c4C6Db690ad' },
  { symbol: 'RGTI',    address: '0xCc3fAcFbB7328CE64874e52d418A8bC1acFaE419' },
  { symbol: 'RIVN',    address: '0x6Aa636d91ceF85B7A93F8a09311D13b51904fA74' },
  { symbol: 'RUN',     address: '0xc41285d4C55164F11379415EC31EEf30912894cC' },
  { symbol: 'SATS',    address: '0x9e531AD2De512195cC91b5AA84eF7Bf6E2F1B9a6' },
  { symbol: 'SHOP',    address: '0xc961F652e8DecaceCE052D45F6eFfeB3a4D261E3' },
  { symbol: 'SHY',     address: '0x02527F6d66817a0503E0A578E26bff0CA4E7C67C' },
  { symbol: 'SIMO',    address: '0x1d7C6295AA53881Bc5c932345f552f1dDf8D7688' },
  { symbol: 'SKHY',    address: '0x59EC159579E2453dd1F16949798bb53383467E5a' },
  { symbol: 'SLS',     address: '0x7A2C564e735552c727Bdd215434aDb38EBfb5399' },
  { symbol: 'SMH',     address: '0x9A990570eD7f6bB8314099bdE659f8be4FCF778A' },
  { symbol: 'SMR',     address: '0x6DeC06E63ad11C120c3636d8CD0c58D73837061D' },
  { symbol: 'SNAP',    address: '0x8C5e917FE38efe5E86949dB6eBF79bE45459d3cA' },
  { symbol: 'SCHD',    address: '0xc3685B579D02862688cc718ef6C03AB116fF8421' },
  { symbol: 'SNOW',    address: '0xD921469BD0D870Cf1707529A1D6d779CE48f43D1' },
  { symbol: 'SOFI',    address: '0x66513702b5C0fe4Bc7591b1f92DA9B2181B9F653' },
  { symbol: 'SOUN',    address: '0x5d4e103B55cCCecF4dEe4Da4B7Aeda1541EdD9A0' },
  { symbol: 'SOXX',    address: '0xB93505D61Fa45BAE9081Dc68796202412d12794e' },
  { symbol: 'SPMO',    address: '0xa7Db9e9b34b0D61F04614923A043f75BE7dA0F83' },
  { symbol: 'TE',      address: '0x1512fdB51dD7E5302B1a357c5E07FD0f02906725' },
  { symbol: 'TEAM',    address: '0x5DB2dEF2b004202EF982aDE59dC5851b15b9B1F0' },
  { symbol: 'TEM',     address: '0x42aa599807f402D0c10FC33e6C96025940b07587' },
  { symbol: 'TER',     address: '0x27167e22C489b81Ede3acD9Df88642FC2D59C5A2' },
  { symbol: 'TSEM',    address: '0xB9eA6129d6A2C5fB7B72cC6cfdaD8843753EaBDC' },
  { symbol: 'TSM',     address: '0x672Fb8b9fE18B3109398B30970C157B7A851Cbe9' },
  { symbol: 'TTD',     address: '0xD033fc3Cd271653E0eD27fa449217473fa008f0e' },
  { symbol: 'TTWO',    address: '0x92c69260dE2c4F1e005584cc80CA7FD7Fd9A9673' },
  { symbol: 'UMC',     address: '0xE4DD1cC484Bb9B7d21d504937304c9223c40a52B' },
  { symbol: 'UNH',     address: '0xeF47eD16f91D45888209218fc460b4733E778B93' },
  { symbol: 'UPS',     address: '0x1D6C16ABB1a8aac8fcA7d59272aA5d4F8671Fdbf' },
  { symbol: 'USO',     address: '0x39B727d6c7F368eb0BF1F1759b5dC6a4f2b859f2' },
  { symbol: 'VICR',    address: '0xc4A8D55444061946B7b1a45bd677E03Ef581Dc4e' },
  { symbol: 'VRT',     address: '0xea4495DbB1bdAD7Bf4486c74A3F8cca13A007F3D' },
  { symbol: 'VSAT',    address: '0x63516fF3E549A516EC8A904a063B0c90828fC0D9' },
  { symbol: 'VST',     address: '0xe45841B7E18E8F62D9Fa01b85288176850E783a1' },
  { symbol: 'VTI',     address: '0xdE6c3A489C1a677D6d611d320faF200d6d44d819' },
  { symbol: 'WDAY',    address: '0x8B69f24EE29b494D1468570E4BfbC1Fc5016C8E8' },
  { symbol: 'WDC',     address: '0x68dB657D20052D18E6942F1DcA98899D992850AB' },
  { symbol: 'WULF',    address: '0x99860919d17045F8D8EdC1256B236607ad9Aab74' },
  { symbol: 'WYFI',    address: '0x13D1E4808586d11A8B329F33f2b1725D15e353Ce' },
  { symbol: 'XLK',     address: '0xde23Ad28b7c88099843c15cca0fF0aE276c72afE' },
  { symbol: 'XNDU',    address: '0x6c3B7262D2a5C97d1668A163357bb9c13cc2Fb2F' },
  { symbol: 'XOM',     address: '0x421a6683EbcBd080798b8EC867CeB2596D1e0fAf' },
  { symbol: 'ZETA',    address: '0x2E6dCf1AfD2712D385530D61BFe85A9A26D7fb23' },
  { symbol: 'ZM',      address: '0x2edcE46f6F0AaB0fD0529B5c670B11b32e0768bE' },
  { symbol: 'ZS',      address: '0x920D680Cbc104Bd972ABB123ae9b69d56C12c04b' },
];

const ERC20_ABI = [
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'decimals',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const;

const client = createPublicClient({ transport: http(RPC) });

// Multicall3.aggregate3 is declared "view" here so it can be eth_call-ed through
// readContract; a single request covers every supply + decimals read.
const MULTICALL_ABI = [
  {
    name: 'aggregate3',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' },
        ],
      },
    ],
    outputs: [
      {
        name: 'returnData',
        type: 'tuple[]',
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' },
        ],
      },
    ],
  },
] as const;

const SUPPLY_CALL = encodeFunctionData({ abi: ERC20_ABI, functionName: 'totalSupply' });
const DECIMALS_CALL = encodeFunctionData({ abi: ERC20_ABI, functionName: 'decimals' });

async function fetchSupplies(): Promise<(number | null)[]> {
  const calls = TOKENS.flatMap((t) => [
    { target: t.address, allowFailure: true, callData: SUPPLY_CALL },
    { target: t.address, allowFailure: true, callData: DECIMALS_CALL },
  ]);
  const results = await client.readContract({
    address: MULTICALL3,
    abi: MULTICALL_ABI,
    functionName: 'aggregate3',
    args: [calls],
  });
  return TOKENS.map((_, i) => {
    const supply = results[i * 2];
    const decimals = results[i * 2 + 1];
    if (!supply.success || !decimals.success) return null;
    try {
      const raw = decodeFunctionResult({ abi: ERC20_ABI, functionName: 'totalSupply', data: supply.returnData });
      const dec = decodeFunctionResult({ abi: ERC20_ABI, functionName: 'decimals', data: decimals.returnData });
      return Number(formatUnits(raw, dec));
    } catch {
      return null;
    }
  });
}

async function fetchPrice(symbol: string): Promise<number | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
      const r = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fenus-Protocol/1.0)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      return typeof price === 'number' ? price : null;
    } catch {
      if (attempt === 2) return null;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return null;
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

type TokenTvl = { symbol: string; totalSupply: number; price: number | null; value: number };
type TvlData = {
  tvl: number;
  updatedAt: number;
  tokenCount: number;
  missingPrices: string[];
  tokens: TokenTvl[];
};

// Last good price per symbol, so one failed Yahoo lookup doesn't drop a token's
// value out of the total.
const lastPrice = new Map<string, number>();

// In-memory cache — persists across warm invocations.
let cache: { at: number; data: TvlData } | null = null;
const TTL_MS = 120_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (cache && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(cache.data);
  }

  try {
    const supplies = await fetchSupplies();

    // Only tokens with minted supply contribute value, so only price those.
    const live = TOKENS.map((t, i) => ({ symbol: t.symbol, totalSupply: supplies[i] ?? 0 })).filter((t) => t.totalSupply > 0);

    const prices = await pool(live, 10, async (t) => {
      const p = await fetchPrice(t.symbol);
      if (p != null) lastPrice.set(t.symbol, p);
      return p ?? lastPrice.get(t.symbol) ?? null;
    });

    const tokens: TokenTvl[] = live.map((t, i) => ({
      symbol: t.symbol,
      totalSupply: t.totalSupply,
      price: prices[i],
      value: prices[i] != null ? t.totalSupply * (prices[i] as number) : 0,
    }));

    const data: TvlData = {
      tvl: tokens.reduce((sum, t) => sum + t.value, 0),
      updatedAt: Date.now(),
      tokenCount: TOKENS.length,
      missingPrices: tokens.filter((t) => t.price == null).map((t) => t.symbol),
      tokens,
    };
    cache = { at: Date.now(), data };

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    console.error('TVL: failed', e);
    // Serve the last good snapshot rather than failing the section outright.
    if (cache) return res.status(200).json(cache.data);
    return res.status(502).json({ error: 'Failed to compute TVL' });
  }
}
