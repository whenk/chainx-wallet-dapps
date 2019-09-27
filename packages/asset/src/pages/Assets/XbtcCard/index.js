import React from 'react'
import xbtcLogo from './xbtc.svg'
import { useSelector } from 'react-redux'
import { xbtcAssetSelector, xbtcMetaSelector } from '../selectors'
import AssetCard from '../components/AssetCard'
import InfoView from '../components/InfoView'
import $t from '../../../locale'
import AssetView from '../components/AssetView'
import styled from 'styled-components'

const DetailWrapper = styled.div`
  & > div:not(:first-of-type) {
    margin-top: 16px;
  }
`

const AssetLine = styled.div`
  display: flex;
  & > div {
    flex: 1;
  }
`

export default function() {
  const meta = useSelector(xbtcMetaSelector)
  const { details } = useSelector(xbtcAssetSelector)
  console.log('details', details)

  const showDetails = meta.precision && Object.keys(details).length > 0

  return (
    <AssetCard meta={meta} details={details} logo={xbtcLogo}>
      <div className="details">
        {showDetails && (
          <DetailWrapper>
            <AssetLine>
              <InfoView title={$t('ASSET_CHAIN')} info={meta.chain} />
              <AssetView
                title={$t('ASSET_TOTAL')}
                value={details.total}
                precision={meta.precision}
              />
            </AssetLine>
            <AssetLine>
              <AssetView
                title={$t('ASSET_RESERVED_DEX_SPOT')}
                value={details.reservedDexSpot}
                precision={meta.precision}
              />
              <AssetView
                title={$t('ASSET_RESERVED_WITHDRAWAL')}
                value={details.reservedWithdrawal}
                precision={meta.precision}
              />
            </AssetLine>
          </DetailWrapper>
        )}
      </div>
    </AssetCard>
  )
}
