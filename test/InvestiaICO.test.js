import assertRevert from 'helpers/assertRevert';

const InvestiaToken = artifacts.require('InvestiaToken');
const InvestiaICO = artifacts.require('InvestiaICO');

const assertJump = function(error) {
  assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Invalid opcode error must be returned');
};

contract('InvestiaICO', function (accounts) {
  const rate = 1000;
  const beneficiary = accounts[9];

  beforeEach(async function () {
    this.ico = await InvestiaICO.new(rate, beneficiary);
  });

  it('should be active after creation', async function () {
    const hasEnded = await this.ico.hasEnded();
    assert.equal(false, hasEnded);
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
