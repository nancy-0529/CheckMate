import { describe, expect, it } from 'vitest'
import { checkAmount } from './amount-check'

describe('E-01 金額比對', () => {
  it('依輸入比對，修改金額會改變結果', () => {
    expect(checkAmount('1480', true, '1480').status).toBe('一致')
    expect(checkAmount('1680', true, '1480')).toMatchObject({ status: '不一致', differenceCents: 20000 })
    expect(checkAmount('1000', true, '1050').differenceCents).toBe(-5000)
  })
  it('缺附件與附件金額未填分開', () => {
    expect(checkAmount('2800', false, '').status).toBe('缺憑證')
    expect(checkAmount('2800', true, '').status).toBe('無法判斷')
  })
  it('精確比較兩位小數，不使用浮點容差', () => {
    expect(checkAmount('0.30', true, '0.3').status).toBe('一致')
    expect(checkAmount('100.01', true, '100.00').differenceCents).toBe(1)
    expect(checkAmount('0', true, '0').status).toBe('一致')
  })
  it.each(['', '-1', 'abc', 'NaN', 'Infinity', '1.001', '1e3', '9,999', '9007199254740992'])('拒絕無效金額 %s', value => {
    expect(checkAmount(value, true, '100').status).toBe('無法判斷')
    expect(checkAmount('100', true, value).status).toBe('無法判斷')
  })
})
