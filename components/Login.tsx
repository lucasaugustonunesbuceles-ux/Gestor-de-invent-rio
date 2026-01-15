
import React, { useState, useEffect } from 'react';
import { UserSession, RegisteredUser } from '../types';

interface Props {
  onLogin: (user: UserSession) => void;
}

type ViewState = 'login' | 'register' | 'forgot' | 'reset' | 'delete_account';

const Login: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('login');
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Recovery States
  const [foundUser, setFoundUser] = useState<RegisteredUser | null>(null);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha o usuário e a senha.');
      return;
    }

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      onLogin({ username: user.username, role: user.role });
    } else {
      const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        setError('Senha incorreta. Verifique suas credenciais.');
      } else {
        setError('Registro não encontrado. Por favor, crie uma conta.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim() || !password.trim() || !securityQuestion.trim() || !securityAnswer.trim()) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    // Regra da Chave ADM solicitada
    if (adminKey !== '' && adminKey !== 'TerryCrews') {
      setError('Chave ADM incorreta. Deixe em branco para Visitante ou use a chave válida.');
      setAdminKey('');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('Este nome de usuário já está em uso.');
      return;
    }

    const role = adminKey === 'TerryCrews' ? 'ADM' : 'VISITANTE';

    const newUser: RegisteredUser = { 
      username, 
      password, 
      securityQuestion, 
      securityAnswer,
      role
    };

    setUsers([...users, newUser]);
    setSuccess(`Registro de ${role} concluído!`);
    setView('login');
    setPassword('');
    setAdminKey('');
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const userIndex = users.findIndex(u => 
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (userIndex === -1) {
      setError('Credenciais incorretas. Não foi possível excluir a conta.');
      return;
    }

    if (window.confirm('TEM CERTEZA? Esta ação apagará seu perfil permanentemente do TheStok.')) {
      const newUsers = [...users];
      newUsers.splice(userIndex, 1);
      setUsers(newUsers);
      setSuccess('Sua conta foi excluída com sucesso.');
      setView('login');
      setUsername('');
      setPassword('');
    }
  };

  const handleForgotSearch = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setFoundUser(user);
      setView('reset');
    } else {
      setError('Usuário não localizado.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (securityAnswer.toLowerCase() === foundUser?.securityAnswer.toLowerCase()) {
      if (password !== confirmPassword) {
        setError('As novas senhas não coincidem.');
        return;
      }
      
      const updatedUsers = users.map(u => 
        u.username === foundUser.username ? { ...u, password: password } : u
      );
      setUsers(updatedUsers);
      setSuccess('Senha redefinida com sucesso!');
      setView('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('Resposta de segurança incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4">
            <i className={`fas ${view === 'register' ? 'fa-user-plus' : view === 'delete_account' ? 'fa-user-minus text-red-400' : 'fa-layer-group'} text-2xl`}></i>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase text-center">
            TheStok
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-[0.2em] text-center">
            {view === 'login' ? 'Identificação de Acesso' : view === 'register' ? 'Registro de Usuário' : view === 'delete_account' ? 'Exclusão de Perfil' : 'Recuperação'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-sm"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3">
            <i className="fas fa-check-circle text-sm"></i>
            {success}
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input 
              type="password"
              placeholder="Senha Pessoal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">
              ENTRAR
            </button>
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-slate-800">
              <button 
                type="button"
                onClick={() => { setView('register'); resetMessages(); }}
                className="text-xs font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest"
              >
                Criar Nova Conta
              </button>
              <div className="flex justify-between items-center px-1">
                <button 
                  type="button"
                  onClick={() => { setView('forgot'); resetMessages(); }}
                  className="text-[10px] font-black text-slate-500 hover:text-indigo-300 uppercase tracking-widest"
                >
                  Recuperar Senha
                </button>
                <button 
                  type="button"
                  onClick={() => { setView('delete_account'); resetMessages(); }}
                  className="text-[10px] font-black text-red-500/60 hover:text-red-400 uppercase tracking-widest"
                >
                  Apagar minha conta
                </button>
              </div>
            </div>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <input 
                type="password"
                placeholder="Repetir"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div className="space-y-2 p-4 bg-slate-800/40 rounded-3xl border border-slate-700/50">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Segurança</label>
              <input 
                type="text"
                placeholder="Pergunta: Ex: Nome do seu pet?"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <input 
                type="text"
                placeholder="Sua Resposta"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Chave ADM (Vazio para Visitante)</label>
              <input 
                type="password"
                placeholder="Digite a Chave Secreta"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-lg active:scale-95">
              REGISTRAR
            </button>
            <button type="button" onClick={() => setView('login')} className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2">
              Voltar
            </button>
          </form>
        )}

        {view === 'delete_account' && (
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl mb-4">
               <p className="text-xs text-red-400 text-center font-bold">Confirme seu usuário e senha para prosseguir com a exclusão definitiva.</p>
            </div>
            <input 
              type="text"
              placeholder="Seu Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <input 
              type="password"
              placeholder="Sua Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">
              EXCLUIR PERFIL AGORA
            </button>
            <button type="button" onClick={() => setView('login')} className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2">
              Cancelar
            </button>
          </form>
        )}

        {/* Views de Recuperação omitidas para brevidade, mas mantidas no código real conforme necessário */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSearch} className="space-y-4">
             <input type="text" placeholder="Seu Usuário" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
             <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-2xl">Buscar Conta</button>
             <button type="button" onClick={() => setView('login')} className="w-full text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest">Voltar</button>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-2">
                <p className="text-[10px] font-black text-slate-500 uppercase">Pergunta Secreta:</p>
                <p className="text-sm font-bold text-indigo-400 italic">"{foundUser?.securityQuestion}"</p>
             </div>
             <input type="text" placeholder="Resposta" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
             <div className="grid grid-cols-2 gap-3">
                <input type="password" placeholder="Nova Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none" />
                <input type="password" placeholder="Repetir" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-slate-800 border-none rounded-2xl py-3 px-6 text-white outline-none" />
             </div>
             <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl">Salvar Nova Senha</button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            THESTOK • PROTOCOLO DE SEGURANÇA ATIVO
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
