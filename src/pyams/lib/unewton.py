#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      dhiab fathi
#
# Created:     08/01/2025
# Copyright:   (c) dhiab fathi 2025
# Licence:     <your licence>
#-------------------------------------------------------------------------------


from math import fabs,sqrt


#-------------------------------------------------------------------------------
# def norm: the norm of a vector
#-------------------------------------------------------------------------------

def norm(x):
    try:
      return sqrt(sum(i**2 for i in x))
    except:
      return sqrt(1e+6)



#-------------------------------------------------------------------------------
# def parab3p: Apply three-point safeguarded parabolic model for a line search
#-------------------------------------------------------------------------------
def parab3p(lambdac, lambdam, ff0, ffc, ffm):
    sigma0 = 0.1;
    sigma1 = 0.9;
    c2= lambdam*(ffc-ff0)-lambdac*(ffm-ff0);
    if c2 >= 0:
        return sigma1*lambdac;
    c1 = (lambdac*lambdac*(ffm-ff0))-(lambdam*lambdam*(ffc-ff0));
    a= -c1*0.5/c2;
    if (a < sigma0*lambdac):
        a= sigma0*lambdac;
    if(a > sigma1*lambdac):
        a= sigma1*lambdac;
    return a;

#-------------------------------------------------------------------------------
# def armijo: line search by armijo method
#-------------------------------------------------------------------------------
#armijo(dx, x, F, 40, y, n)
def armijo(direction,x,f0,maxarm,f,n):
    iarm = 0;
    sigma1= 0.8;
    alpha= 1.0e-12;
    armflag= 0;
    xp = x.copy()
    xold = x.copy()
    xt = [0 for i in range(n)]
    lamb=1.0;
    lamm=0.1;
    lamc=lamb;

    for i in range(0,n):
        xt[i]= x[i]-lamb*direction[i];
    ft= f(xt);
    nft = norm(ft);
    nf0 = norm(f0);
    ff0 = nf0*nf0;
    ffc = nft*nft;
    ffm = nft*nft;
    maxarm=80;
    while nft>= ((1-alpha*lamb)*nf0):
        xold = xt.copy()  # Save previous x
        fp = ft.copy()  # Save previous function value
        lamb=0.7*lamb

        if iarm ==0:
          lamb = sigma1*lamb;
        else:
          lamb = parab3p(lamc, lamm, ff0, ffc, ffm);

        for i in range(0,n):
              xt[i]= x[i] -lamb*direction[i];

        lamm = lamc;
        lamc = lamb;
        # Keep the books on the function norms.
        ft= f(xt);
        nft= norm(ft);
        ffm = ffc;
        ffc = nft*nft;
        iarm= iarm+1;
        if (iarm > maxarm):
            armflag= 1;
            x=xold.copy();
            f0=fp.copy();
            return x;
    x = xt.copy();
    f0 = ft.copy();
    return x;



#-------------------------------------------------------------------------------
# def solveLU: solving a system with an LU-Factorization
#-------------------------------------------------------------------------------

def solveLU(matrix_a, vector_b, n):
    """
    Solves a system of linear equations Ax = b using LU decomposition with partial pivoting.

    Args:
        matrix_a (list[list[float]]): Coefficient matrix A.
        vector_b (list[float]): Right-hand side vector b.
        n (int): Dimension of the square matrix A (number of rows/columns).

    Returns:
        list[float]: Solution vector x.
    """
    # Copy inputs to avoid modifying them
    a = [row[:] for row in matrix_a]
    b = vector_b[:]

    # Initialize helper variables
    v = [0.0] * n      # Scaling factors for each row
    indx = [0.0] * n   # Pivoting order (initialized to identity)
    tiny = 1e-20             # Small value to prevent division by zero
    d = 1;

    for  i in  range(n):
         big = 0.0;
         for  j in  range(n):
             temp = abs(a[i][j]);
             if (temp > big):
                 big = temp;
         if (big != 0.0):
            v[i] = 1.0 / big;
         else:
            v[i] = 100000000.0;

    for  j in  range(n):
        for  i in  range(j):
             sum_ = a[i][j];
             for  k in  range(i):
                sum_ = sum_ - (a[i][k]*a[k][j]);
             a[i][j] = sum_;

        big = 0.0;
        for  i in  range(j,n):
         sum_ = a[i][j];
         for  k in  range(j):
                sum_ = sum_ - (a[i][k] * a[k][j]);
         a[i][j] = sum_;
         dum = v[i] * abs(sum_);
         if (dum >= big):
             big = dum;
             imax = i;
        if (j != imax):
            for  k in  range(n):
                dum = a[imax][k];
                a[imax][k] = a[j][k];
                a[j][k] =dum;
            d = -d;
            v[imax] = v[j];

        indx[j] = imax;

        if (a[j][j]== 0.0):
            a[j][j] = tiny;

        if (j != n):
            dum =1.0/a[j][j];
            for  i in  range(j+1,n):
                a[i][j] = a[i][j] * dum;

    ii = -1;
    for  i in  range(n):
        ip = indx[i];
        sum_ = b[ip];
        b[ip] = b[i];
        if (ii != -1):
            for  j in  range(ii,i):
                sum_ = sum_ -a[i][j]*b[j];
        else:
            if (sum_ !=0.0):
                ii = i;
        b[i]=sum_;

    i=n-1;
    while (i >= 0):
        sum_ = b[i];
        for  j in  range(i+1,n):
             sum_ = sum_ - a[i][j]*b[j];
        if (a[i][i] != 0.0):
             b[i]=sum_/a[i][i];
        else:
             b[i]=sum_/tiny;
        i=i-1;
    return b;






#-------------------------------------------------------------------------------
# Jacobian matrix
#-------------------------------------------------------------------------------
def jac(x, f, n):
    delta = 1e-6
    J = [[0] * n for i in range(n)]
    for i in range(n):
        x[i] += delta
        f_plus = f(x)
        x[i] -= 2 * delta
        f_minus = f(x)
        x[i] += delta
        for k in range(n):
            J[k][i] = (f_plus[k] - f_minus[k]) / (2*delta)
    return J

#-------------------------------------------------------------------------------
# Solving systems of nonlinear equations by Newton-Raphson method
#-------------------------------------------------------------------------------
def solven(x, y,option):
    max_iter, tol = option.itl, option.error
    n = len(x)
    for i in range(max_iter):
        F = y(x)
        if norm(F) < tol:
            return x, True
        J = jac(x, y, n)
        dx = solveLU(J, F, n)
        x = armijo(dx, x, F, 40, y, n)
    return x, False


def solvenSample(x, y):
    max_iter, tol = 160, 1e-8
    n = len(x)
    for i in range(max_iter):
        F = y(x)
        if norm(F) < tol:
            return x, True
        J = jac(x, y, n)
        dx = solveLU(J, F, n)
        x = armijo(dx, x, F, 40, y, n)
    return x, False

#-------------------------------------------------------------------------------
# Test
#-------------------------------------------------------------------------------
if __name__ == '__main__':
    # Solve linear system
    a = [[1.0, 2.0], [3.0, 4.0]]
    b = [3.0, 7.0]
    print("Linear solution:", solveLU(a, b, 2))
    from math import exp
    # Solve nonlinear system
    def test_f(x):
        return [
            x[0] * x[2] - 7,
            x[0] * x[1] - 4,
            x[2] * x[1] - exp(x[3]),
            x[3] ** 2 - x[2],
            x[4] ** 2 - x[1],
        ]

    x0 = [2, 1, 1, 0, 0]
    solution, success = solvenSample(x0, test_f)
    if success:
        print("Nonlinear solution:", solution)
    else:
        print("Failed to converge.")