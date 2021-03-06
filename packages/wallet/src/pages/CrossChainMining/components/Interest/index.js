import styled from 'styled-components'
import { toPrecision } from '../../../../utils'
import { PrimaryButton } from '@chainx/ui'
import React, { useState } from 'react'
import warningIcon from './warning.svg'
import Condition from './Condition'
import $t from '../../../../locale'
import forbiddenIcon from './forbidden.svg'
import Forbidden from './Forbidden'

const Wrapper = styled.section`
  display: flex;
  align-items: center;
  position: relative;
  label {
    opacity: 0.32;
    font-size: 12px;
    color: #000000;
    letter-spacing: 0.2px;
    line-height: 16px;
    margin-right: 8px;
  }
  & > span {
    display: inline-flex;
    font-weight: 500;
    font-size: 16px;
    color: #000000;
    letter-spacing: 0.12px;
    line-height: 24px;
    min-width: 200px;
    & > span {
      display: inline-flex;
      align-items: center;
    }
    img {
      margin-left: 6px;
      width: 16px;
    }
    span.interest {
      opacity: ${props => (props.forbidden ? 0.32 : 0.72)};
    }
  }

  button {
    width: 84px;
    span {
      width: 84px !important;
      font-size: 14px !important;
    }
  }

  div.operates {
    display: flex;
    align-items: center;

    img {
      margin-left: 16px;
    }
  }
`

export default function(props) {
  const {
    interest,
    precision,
    claim,
    token,
    disabled,
    claimInfo = {},
    forbidden = false
  } = props
  const { canClaim } = claimInfo
  const [openCondition, setOpenCondition] = useState(false)
  const [openForbidden, setOpenForbidden] = useState(false)

  return (
    <Wrapper forbidden={forbidden}>
      <label>{$t('PSEDU_INTEREST')}</label>
      <span>
        <span className="interest">{toPrecision(interest, precision)} PCX</span>
        {interest > 0 && !canClaim ? (
          <span onMouseEnter={() => setOpenCondition(true)}>
            <img src={warningIcon} alt="interest" />
          </span>
        ) : null}
      </span>
      <div className="operates">
        <PrimaryButton
          disabled={
            !canClaim || disabled || [token.LBTC, token.SDOT].includes(token)
          }
          size="small"
          onClick={() => claim(token)}
        >
          {$t('PSEDU_CLAIM')}
        </PrimaryButton>
        {forbidden && (
          <img
            src={forbiddenIcon}
            alt="forbidden"
            onMouseEnter={() => setOpenForbidden(true)}
          />
        )}
      </div>
      {interest > 0 && openCondition ? (
        <Condition
          claimInfo={claimInfo}
          close={() => setOpenCondition(false)}
        />
      ) : null}
      {openForbidden && <Forbidden close={() => setOpenForbidden(false)} />}
    </Wrapper>
  )
}
