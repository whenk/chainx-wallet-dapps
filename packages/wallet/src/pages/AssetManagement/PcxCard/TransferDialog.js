import React, { useState } from 'react'
import styled from 'styled-components'
import {
  AmountInput,
  Dialog,
  PrimaryButton,
  SelectInput,
  TextInput
} from '@chainx/ui'
import $t from '../../../locale'
import { pcxFreeSelector } from './selectors'
import { useDispatch, useSelector } from 'react-redux'
import { toPrecision } from '../../../utils'
import { getChainx } from '../../../services/chainx'
import { addressSelector } from '../../../reducers/addressSlice'
import {
  addSnack,
  generateId,
  removeSnack,
  typeEnum
} from '../../../reducers/snackSlice'
import { exFailed, exSuccess } from '../../../utils/constants'
import BigNumber from 'bignumber.js'

const StyledDialog = styled(Dialog)``

const Label = styled.label`
  opacity: 0.32;
  font-size: 14px;
  color: #000000;
  letter-spacing: 0.12px;
  line-height: 20px;
`

const Value = styled.span`
  opacity: 0.72;
  font-size: 14px;
  color: #000000;
  letter-spacing: 0.12px;
  line-height: 20px;
`

export default function({ open, handleClose }) {
  const accountAddress = useSelector(addressSelector)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [addressErrMsg, setAddressErrMsg] = useState('')
  const [amountErrMsg, setAmountErrMsg] = useState('')
  const dispatch = useDispatch()
  const [disabled, setDisabled] = useState(false)

  const free = useSelector(pcxFreeSelector)
  const chainx = getChainx()

  const sign = () => {
    const isAddressValid = chainx.account.isAddressValid(address)
    if (!isAddressValid) {
      setAddressErrMsg($t('ASSET_TRANSFER_ADDR_ERROR'))
      return
    }

    if (isNaN(parseFloat(amount))) {
      setAmountErrMsg($t('ASSET_TRANSFER_AMOUNT_ERROR'))
      return
    }

    const realAmount = BigNumber(amount)
      .multipliedBy(Math.pow(10, free.precision))
      .toNumber()

    if (free && realAmount > free.free) {
      setAmountErrMsg($t('ASSET_TRANSFER_AMOUNT_TOO_MUCH_ERROR'))
      return
    }

    if (window.chainxProvider) {
      setDisabled(true)

      window.chainxProvider
        .signExtrinsic(accountAddress, 'xAssets', 'transfer', [
          address,
          'PCX',
          realAmount,
          memo
        ])
        .then(hex => {
          window.chainxProvider.sendExtrinsic(hex, ({ err, status }) => {
            let id = generateId()
            if (err) {
              dispatch(
                addSnack({
                  id,
                  type: typeEnum.ERROR,
                  title: '错误',
                  message: '提交交易出错'
                })
              )
              setDisabled(false)
              return
            }

            if (status.status !== 'Finalized') {
              return
            }

            if (![exSuccess, exFailed].includes(status.result)) {
              console.error(`Unkonwn extrinsic result: ${status.result}`)
              return
            }

            let type = typeEnum.SUCCESS
            let title = '转账成功'
            let message = `转账数量 ${amount} PCX`

            if (status.result === 'ExtrinsicSuccess') {
              handleClose()
            } else if (status.result === 'ExtrinsicFailed') {
              type = typeEnum.ERROR
              title = '转账失败'
              message = `交易hash ${status.txHash}`
              setDisabled(false)
            }
            dispatch(addSnack({ id, type, title, message }))
            setTimeout(() => {
              dispatch(removeSnack({ id }))
            }, 5000)
          })
        })
        .catch(() => setDisabled(false))
      return
    }

    const extrinsic = chainx.asset.transfer(address, 'PCX', realAmount, memo)
    console.log('extrinsic', extrinsic)

    handleClose(extrinsic)
  }

  return (
    <StyledDialog
      open={open}
      handleClose={() => handleClose()}
      title="Transfer(PCX)"
    >
      <div style={{ padding: 16 }}>
        <div>
          <SelectInput
            value={address}
            placeholder="ChainX 接收地址"
            onChange={value => {
              setAddressErrMsg('')
              setAddress(value)
            }}
            error={!!addressErrMsg}
            errorText={addressErrMsg}
          />
        </div>

        <div style={{ display: 'flex', marginTop: 16, alignItems: 'center' }}>
          <div style={{ width: '50%' }}>
            <AmountInput
              value={amount}
              onChange={value => {
                setAmountErrMsg('')
                setAmount(value)
              }}
              placeholder={$t('ASSET_TRANSFER_AMOUNT')}
              tokenName="PCX"
              precision={8}
              error={!!amountErrMsg}
              errorText={amountErrMsg}
            />
          </div>
          {free ? (
            <div style={{ marginLeft: 16 }}>
              <Label>{$t('ASSET_BALANCE')}</Label>
              <Value>{toPrecision(free.free, free.precision)} PCX</Value>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 16 }}>
          <TextInput
            value={memo}
            onChange={setMemo}
            placeholder={$t('COMMON_MEMO')}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <PrimaryButton
            disabled={disabled}
            size="fullWidth"
            onClick={() => sign()}
          >
            {$t('COMMON_CONFIRM')}
          </PrimaryButton>
        </div>
      </div>
    </StyledDialog>
  )
}
