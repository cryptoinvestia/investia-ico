import assertRevert from './helpers/assertRevert';
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime'

const InvestiaToken = artifacts.require('InvestiaToken');
const InvestiaICO = artifacts.require('InvestiaICO');

contract('InvestiaICO', function (accounts) {
  const rate = 1000;
  const beneficiary = accounts[9];

  beforeEach(async function () {
    this.ico = await InvestiaICO.new(rate, beneficiary);
    this.startTime = latestTime();
  });

  it('should be active after creation', async function () {
    const hasEnded = await this.ico.hasEnded();
    assert.equal(false, hasEnded);
  });

  it('should be inactive after end time', async function () {
    await increaseTimeTo(this.startTime + duration.days(91));
    const hasEnded = await this.ico.hasEnded();
    assert.equal(true, hasEnded);
  });

  it('should allow to transfer ownership', async function () {
    await this.ico.transferOwnership(accounts[1]);
    const newOwner = await this.ico.owner();
    assert.equal(accounts[1], newOwner);
  });

  it('should not allow to transfer ownership by not owner', async function () {
    await assertRevert(this.ico.transferOwnership(accounts[1], { from: accounts[1] }));
  });
});
