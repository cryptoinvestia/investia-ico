import assertRevert from './helpers/assertRevert';
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const InvestiaToken = artifacts.require('InvestiaToken');
const InvestiaICO = artifacts.require('InvestiaICO');

contract('InvestiaICO', function (accounts) {
  const rate = 1000;
  const investor = accounts[1];
  const wallet = accounts[9];

  beforeEach(async function () {
    this.ico = await InvestiaICO.new(rate, wallet);
    this.startTime = latestTime();

    this.token = InvestiaToken.at(await this.ico.token());
  });

  describe('ico duration', async function () {
    it('should be active after creation', async function () {
      const hasEnded = await this.ico.hasEnded();
      assert.equal(false, hasEnded);
    });

    it('should be inactive after end time', async function () {
      await increaseTimeTo(this.startTime + duration.days(91));
      const hasEnded = await this.ico.hasEnded();
      assert.equal(true, hasEnded);
    });
  });

  describe('ownership', async function () {
    it('should allow to transfer ownership', async function () {
      await this.ico.transferOwnership(accounts[1]);
      const newOwner = await this.ico.owner();
      assert.equal(accounts[1], newOwner);
    });

    it('should not allow to transfer ownership by not owner', async function () {
      await assertRevert(this.ico.transferOwnership(accounts[1], { from: accounts[1] }));
    });
  });

  describe('token ownership', async function () {
    it('should disallow to transfer token ownership before ico ends', async function () {
      await assertRevert(this.ico.transferTokenOwnership(wallet));
    });

    describe('after ico has ended', async function () {
      beforeEach(async function () {
        await increaseTimeTo(this.startTime + duration.days(91));
      });

      it('should disallow non owners to transfer token ownership', async function () {
        await assertRevert(this.ico.transferTokenOwnership(accounts[1], { from: accounts[1] }))
      });

      it('should allow owners to transfer token ownership', async function () {
        await this.ico.transferTokenOwnership(accounts[1]);
        const newTokenOwner = await this.token.owner();
        assert.equal(accounts[1], newTokenOwner);
      });
    });
  });

  describe('changing rate', async function () {
    it('should allow the owner to change rate', async function () {
      await this.ico.setRate(2000);
      const newRate = await this.ico.rate();
      assert.equal(2000, newRate);
    });

    it('should not allow not owners to change rate', async function () {
      await assertRevert(this.ico.setRate(2000, { from: accounts[1] }));
    });
  });

  describe('sending ether to fallback function', async function () {
    it('should reject transfers of less than 0.25 ETH', async function () {
      await assertRevert(this.ico.send(web3.toWei(0.1, "ether")));
      await assertRevert(this.ico.buyTokens(
        investor, { from: investor, value: web3.toWei(0.1, "ether") }
      ));
    });

    it('should issue tokens for transfers of more than 0.25 ETH', async function () {
      await this.ico.sendTransaction(
        { value: web3.toWei(2, "ether"), from: investor }
      );
      const investorBalance = await this.token.balanceOf(investor);
      assert.equal(2000, web3.fromWei(investorBalance, "ether").toNumber());
    });

    it('should issue bonus tokens to wallet address', async function () {
      await this.ico.sendTransaction(
        { value: web3.toWei(2, "ether"), from: investor }
      );
      const walletBalance = await this.token.balanceOf(wallet);
      assert.equal(400, web3.fromWei(walletBalance, "ether").toNumber());
    });

    it('should transfer funds to wallet', async function () {
      const balancePre = web3.eth.getBalance(wallet);
      await this.ico.sendTransaction(
        { value: web3.toWei(2, "ether"), from: investor }
      );
      const balancePost = web3.eth.getBalance(wallet);
      const etherDifference = web3.fromWei(balancePost.minus(balancePre), "ether").toNumber();
      assert.equal(2, etherDifference);
    });
  });
});
