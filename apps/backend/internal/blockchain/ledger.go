// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package blockchain

import (
	"context"
	"crypto/ecdsa"
	"errors"
	"fmt"
	"log"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// LedgerMetaData contains all meta data concerning the Ledger contract.
var LedgerMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"blockNumber\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"dataHash\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"previousHash\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"timestamp\",\"type\":\"uint256\"}],\"name\":\"BlockAdded\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_dataHash\",\"type\":\"string\"}],\"name\":\"addRecordHash\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"blockCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lastHash\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// LedgerABI is the input ABI used to generate the binding from.
// Deprecated: Use LedgerMetaData.ABI instead.
var LedgerABI = LedgerMetaData.ABI

// Ledger is an auto generated Go binding around an Ethereum contract.
type Ledger struct {
	LedgerCaller     // Read-only binding to the contract
	LedgerTransactor // Write-only binding to the contract
	LedgerFilterer   // Log filterer for contract events
}

// LedgerCaller is an auto generated read-only Go binding around an Ethereum contract.
type LedgerCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LedgerTransactor is an auto generated write-only Go binding around an Ethereum contract.
type LedgerTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LedgerFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type LedgerFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LedgerSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type LedgerSession struct {
	Contract     *Ledger           // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// LedgerCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type LedgerCallerSession struct {
	Contract *LedgerCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// LedgerTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type LedgerTransactorSession struct {
	Contract     *LedgerTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// LedgerRaw is an auto generated low-level Go binding around an Ethereum contract.
type LedgerRaw struct {
	Contract *Ledger // Generic contract binding to access the raw methods on
}

// LedgerCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type LedgerCallerRaw struct {
	Contract *LedgerCaller // Generic read-only contract binding to access the raw methods on
}

// LedgerTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type LedgerTransactorRaw struct {
	Contract *LedgerTransactor // Generic write-only contract binding to access the raw methods on
}

// NewLedger creates a new instance of Ledger, bound to a specific deployed contract.
func NewLedger(address common.Address, backend bind.ContractBackend) (*Ledger, error) {
	contract, err := bindLedger(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Ledger{LedgerCaller: LedgerCaller{contract: contract}, LedgerTransactor: LedgerTransactor{contract: contract}, LedgerFilterer: LedgerFilterer{contract: contract}}, nil
}

// NewLedgerCaller creates a new read-only instance of Ledger, bound to a specific deployed contract.
func NewLedgerCaller(address common.Address, caller bind.ContractCaller) (*LedgerCaller, error) {
	contract, err := bindLedger(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &LedgerCaller{contract: contract}, nil
}

// NewLedgerTransactor creates a new write-only instance of Ledger, bound to a specific deployed contract.
func NewLedgerTransactor(address common.Address, transactor bind.ContractTransactor) (*LedgerTransactor, error) {
	contract, err := bindLedger(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &LedgerTransactor{contract: contract}, nil
}

// NewLedgerFilterer creates a new log filterer instance of Ledger, bound to a specific deployed contract.
func NewLedgerFilterer(address common.Address, filterer bind.ContractFilterer) (*LedgerFilterer, error) {
	contract, err := bindLedger(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &LedgerFilterer{contract: contract}, nil
}

// bindLedger binds a generic wrapper to an already deployed contract.
func bindLedger(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := LedgerMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ledger *LedgerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Ledger.Contract.LedgerCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ledger *LedgerRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ledger.Contract.LedgerTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ledger *LedgerRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ledger.Contract.LedgerTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ledger *LedgerCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Ledger.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ledger *LedgerTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ledger.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ledger *LedgerTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ledger.Contract.contract.Transact(opts, method, params...)
}

// BlockCount is a free data retrieval call binding the contract method 0x07225b4d.
//
// Solidity: function blockCount() view returns(uint256)
func (_Ledger *LedgerCaller) BlockCount(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Ledger.contract.Call(opts, &out, "blockCount")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BlockCount is a free data retrieval call binding the contract method 0x07225b4d.
//
// Solidity: function blockCount() view returns(uint256)
func (_Ledger *LedgerSession) BlockCount() (*big.Int, error) {
	return _Ledger.Contract.BlockCount(&_Ledger.CallOpts)
}

// BlockCount is a free data retrieval call binding the contract method 0x07225b4d.
//
// Solidity: function blockCount() view returns(uint256)
func (_Ledger *LedgerCallerSession) BlockCount() (*big.Int, error) {
	return _Ledger.Contract.BlockCount(&_Ledger.CallOpts)
}

// LastHash is a free data retrieval call binding the contract method 0x3fa21806.
//
// Solidity: function lastHash() view returns(string)
func (_Ledger *LedgerCaller) LastHash(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _Ledger.contract.Call(opts, &out, "lastHash")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// LastHash is a free data retrieval call binding the contract method 0x3fa21806.
//
// Solidity: function lastHash() view returns(string)
func (_Ledger *LedgerSession) LastHash() (string, error) {
	return _Ledger.Contract.LastHash(&_Ledger.CallOpts)
}

// LastHash is a free data retrieval call binding the contract method 0x3fa21806.
//
// Solidity: function lastHash() view returns(string)
func (_Ledger *LedgerCallerSession) LastHash() (string, error) {
	return _Ledger.Contract.LastHash(&_Ledger.CallOpts)
}

// AddRecordHash is a paid mutator transaction binding the contract method 0xe435cef5.
//
// Solidity: function addRecordHash(string _dataHash) returns()
func (_Ledger *LedgerTransactor) AddRecordHash(opts *bind.TransactOpts, _dataHash string) (*types.Transaction, error) {
	return _Ledger.contract.Transact(opts, "addRecordHash", _dataHash)
}

// AddRecordHash is a paid mutator transaction binding the contract method 0xe435cef5.
//
// Solidity: function addRecordHash(string _dataHash) returns()
func (_Ledger *LedgerSession) AddRecordHash(_dataHash string) (*types.Transaction, error) {
	return _Ledger.Contract.AddRecordHash(&_Ledger.TransactOpts, _dataHash)
}

// AddRecordHash is a paid mutator transaction binding the contract method 0xe435cef5.
//
// Solidity: function addRecordHash(string _dataHash) returns()
func (_Ledger *LedgerTransactorSession) AddRecordHash(_dataHash string) (*types.Transaction, error) {
	return _Ledger.Contract.AddRecordHash(&_Ledger.TransactOpts, _dataHash)
}

// LedgerBlockAddedIterator is returned from FilterBlockAdded and is used to iterate over the raw logs and unpacked data for BlockAdded events raised by the Ledger contract.
type LedgerBlockAddedIterator struct {
	Event *LedgerBlockAdded // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *LedgerBlockAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(LedgerBlockAdded)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(LedgerBlockAdded)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *LedgerBlockAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *LedgerBlockAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// LedgerBlockAdded represents a BlockAdded event raised by the Ledger contract.
type LedgerBlockAdded struct {
	BlockNumber  *big.Int
	DataHash     string
	PreviousHash string
	Timestamp    *big.Int
	Raw          types.Log // Blockchain specific contextual infos
}

// FilterBlockAdded is a free log retrieval operation binding the contract event 0x76d97fe55497d6fd0cd003cc5414efc8d120c1661bc927a30d08bc71906ec15a.
//
// Solidity: event BlockAdded(uint256 indexed blockNumber, string dataHash, string previousHash, uint256 timestamp)
func (_Ledger *LedgerFilterer) FilterBlockAdded(opts *bind.FilterOpts, blockNumber []*big.Int) (*LedgerBlockAddedIterator, error) {

	var blockNumberRule []interface{}
	for _, blockNumberItem := range blockNumber {
		blockNumberRule = append(blockNumberRule, blockNumberItem)
	}

	logs, sub, err := _Ledger.contract.FilterLogs(opts, "BlockAdded", blockNumberRule)
	if err != nil {
		return nil, err
	}
	return &LedgerBlockAddedIterator{contract: _Ledger.contract, event: "BlockAdded", logs: logs, sub: sub}, nil
}

// WatchBlockAdded is a free log subscription operation binding the contract event 0x76d97fe55497d6fd0cd003cc5414efc8d120c1661bc927a30d08bc71906ec15a.
//
// Solidity: event BlockAdded(uint256 indexed blockNumber, string dataHash, string previousHash, uint256 timestamp)
func (_Ledger *LedgerFilterer) WatchBlockAdded(opts *bind.WatchOpts, sink chan<- *LedgerBlockAdded, blockNumber []*big.Int) (event.Subscription, error) {

	var blockNumberRule []interface{}
	for _, blockNumberItem := range blockNumber {
		blockNumberRule = append(blockNumberRule, blockNumberItem)
	}

	logs, sub, err := _Ledger.contract.WatchLogs(opts, "BlockAdded", blockNumberRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(LedgerBlockAdded)
				if err := _Ledger.contract.UnpackLog(event, "BlockAdded", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseBlockAdded is a log parse operation binding the contract event 0x76d97fe55497d6fd0cd003cc5414efc8d120c1661bc927a30d08bc71906ec15a.
//
// Solidity: event BlockAdded(uint256 indexed blockNumber, string dataHash, string previousHash, uint256 timestamp)
func (_Ledger *LedgerFilterer) ParseBlockAdded(log types.Log) (*LedgerBlockAdded, error) {
	event := new(LedgerBlockAdded)
	if err := _Ledger.contract.UnpackLog(event, "BlockAdded", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

type BlockchainClient struct {
	Client         *ethclient.Client
	LedgerInstance *Ledger
	Auth           *bind.TransactOpts
}

// NewBlockchainClient membuat koneksi ke node Ethereum dan smart contract.
func NewBlockchainClient(hardhatURL, contractAddressHex, privateKeyHex string) (*BlockchainClient, error) {
	// 1. Hubungkan ke node Ethereum (Hardhat)
	client, err := ethclient.Dial(hardhatURL)
	if err != nil {
		return nil, err
	}
	log.Println("Terhubung ke node Hardhat Ethereum!")

	// 2. Muat instance smart contract
	contractAddress := common.HexToAddress(contractAddressHex)
	instance, err := NewLedger(contractAddress, client)
	if err != nil {
		return nil, err
	}
	log.Println("Instance smart contract Ledger berhasil dimuat!")

	// 3. Siapkan akun untuk menandatangani transaksi
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, err
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, _ := publicKey.(*ecdsa.PublicKey)
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return nil, err
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		return nil, err
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, err
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // in wei
	auth.GasLimit = uint64(300000) // in units
	// auth.GasPrice akan diatur otomatis

	return &BlockchainClient{
		Client:         client,
		LedgerInstance: instance,
		Auth:           auth,
	}, nil
}

// AddRecord memanggil fungsi addRecordHash di smart contract.
func (bc *BlockchainClient) AddRecord(dataHash string) (*types.Transaction, error) {
	tx, err := bc.LedgerInstance.AddRecordHash(bc.Auth, dataHash)
	if err != nil {
		return nil, err
	}
	// Penting: perbarui nonce untuk transaksi berikutnya
	bc.Auth.Nonce.Add(bc.Auth.Nonce, big.NewInt(1))
	return tx, nil
}

// Definisikan struct untuk data event yang akan kita kirim sebagai JSON
type LedgerEvent struct {
	BlockNumber  *big.Int `json:"block_number"`
	DataHash     string   `json:"data_hash"`
	PreviousHash string   `json:"previous_hash"`
	Timestamp    *big.Int `json:"timestamp"`
}

// GetLedgerHistory mengambil semua event BlockAdded dari smart contract.
func (bc *BlockchainClient) GetLedgerHistory() ([]LedgerEvent, error) {
	// Tentukan filter untuk event "BlockAdded" dari blok pertama (0) hingga terbaru (nil)
	filterOpts := &bind.FilterOpts{
		Start:   0,
		End:     nil,
		Context: context.Background(),
	}

	// Panggil fungsi filter yang sudah di-generate oleh abigen
	iterator, err := bc.LedgerInstance.FilterBlockAdded(filterOpts, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memfilter event: %w", err)
	}
	defer iterator.Close()

	var events []LedgerEvent

	// Lakukan iterasi pada semua event yang ditemukan
	for iterator.Next() {
		event := iterator.Event
		events = append(events, LedgerEvent{
			BlockNumber:  event.BlockNumber,
			DataHash:     event.DataHash,
			PreviousHash: event.PreviousHash,
			Timestamp:    event.Timestamp,
		})
	}

	if err := iterator.Error(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi event: %w", err)
	}

	return events, nil
}
